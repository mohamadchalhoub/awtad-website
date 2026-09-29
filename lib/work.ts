import { supabase } from "@/lib/supabase"
import { categorize, wallSubcategory, type CategoryKey, type WallSub } from "@/lib/site"
import { webUrl } from "@/lib/web-images"

/**
 * The public portfolio, loaded in two queries and shared across pages.
 *
 * The catalogue is small (tens of projects, tens of images), so fetching it
 * whole is cheaper than the per-page waterfalls it replaces and lets every
 * page — home, Our Work, a project and its "next project" link — read from
 * one cached result.
 */

export type Stage = "idea" | "design" | "craft" | "result"

export interface WorkImage {
  id: string
  url: string
  alt: string
  /** Set an image's category to idea / design / craft in the admin to place it in that chapter. */
  stage: Stage
}

export interface WorkItem {
  id: number
  title: string
  description: string
  year: string
  category: CategoryKey
  /** Only meaningful inside Wall Art; drives that collection's filter chips. */
  wallSub: WallSub
  rawCategory: string
  parentId: number | null
  cover?: string
  images: WorkImage[]
  childIds: number[]
}

const STAGES: Stage[] = ["idea", "design", "craft"]

function isUsableUrl(url?: string | null): url is string {
  return !!url && (url.startsWith("https://") || url.startsWith("/"))
}

async function load(): Promise<WorkItem[]> {
  const [projectsRes, imagesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id,title,category,description,year,parent_id,cover_image_id,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("images").select("id,url,name,alt_text,category,project_id,created_at").order("created_at"),
  ])
  if (projectsRes.error) throw projectsRes.error
  if (imagesRes.error) throw imagesRes.error

  const projects = projectsRes.data ?? []
  const images = (imagesRes.data ?? []).filter((i) => isUsableUrl(i.url))
  const byId = new Map(projects.map((p) => [p.id, p]))

  return projects
    .filter((p) => p.title?.trim())
    .map((p) => {
      const parent = p.parent_id ? byId.get(p.parent_id) : undefined
      const own = images.filter((i) => i.project_id === p.id)
      const coverRow = own.find((i) => i.id === p.cover_image_id) ?? own[0]
      const ordered = coverRow ? [coverRow, ...own.filter((i) => i !== coverRow)] : own
      return {
        id: p.id,
        title: p.title.trim(),
        description: (p.description ?? "").trim(),
        year: p.year ?? "",
        category: categorize(p.title, p.category, parent?.title, parent?.category),
        wallSub: wallSubcategory(p.title, p.category, parent?.title, parent?.category),
        rawCategory: p.category ?? "",
        parentId: p.parent_id ?? null,
        cover: coverRow && webUrl(coverRow.url),
        images: ordered.map((i) => {
          const tag = (i.category ?? "").toLowerCase().trim() as Stage
          return {
            id: i.id,
            url: webUrl(i.url),
            alt: i.alt_text || p.title,
            stage: STAGES.includes(tag) ? tag : "result",
          }
        }),
        childIds: projects.filter((c) => c.parent_id === p.id && c.title?.trim()).map((c) => c.id),
      }
    })
}

let cache: Promise<WorkItem[]> | null = null

export function getWork(): Promise<WorkItem[]> {
  if (!cache) {
    cache = load().catch((err) => {
      cache = null
      throw err
    })
  }
  return cache
}

/** Pieces worth showing in a gallery: anything with a photograph. */
export function withPhotos(items: WorkItem[]) {
  return items.filter((i) => i.cover)
}

/**
 * A short, varied selection for the homepage: individual pieces (not
 * collection parents), at most two per collection so no single kind of
 * product dominates, each collection represented before any repeats.
 */
export function featured(items: WorkItem[], limit = 8) {
  const pool = withPhotos(items).filter((i) => i.childIds.length === 0)
  const perCategory = new Map<CategoryKey, WorkItem[]>()
  for (const i of pool) perCategory.set(i.category, [...(perCategory.get(i.category) ?? []), i])
  const out: WorkItem[] = []
  for (let round = 0; round < 2; round++)
    for (const list of perCategory.values()) if (list[round] && out.length < limit) out.push(list[round])
  return out
}

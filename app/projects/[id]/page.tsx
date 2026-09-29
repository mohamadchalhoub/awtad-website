"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Expand, MessageCircle } from "lucide-react"
import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { SmartImage } from "@/components/smart-image"
import { Lightbox } from "@/components/lightbox"
import { WorkGallery } from "@/components/sections/work-gallery"
import { useWork } from "@/hooks/use-work"
import { whatsappUrl } from "@/lib/site"
import { useLocale } from "@/lib/i18n"
import { withPhotos, type Stage, type WorkImage } from "@/lib/work"
import { cn } from "@/lib/utils"

const CHAPTERS: Stage[] = ["idea", "design", "craft", "result"]

/** Customize form type that best matches a portfolio category. */
const TYPE_FOR = { "wall-art": "wall-art", portraits: "portrait", gifts: "gift", business: "business", custom: "other" } as const

/** A sellable item: the photo (tap to enlarge) with its own WhatsApp order button underneath. */
function Photo({
  img,
  onOpen,
  onOrder,
  orderLabel,
  className,
  sizes,
  priority,
}: {
  img: WorkImage
  onOpen: () => void
  onOrder?: () => void
  orderLabel?: string
  className?: string
  sizes: string
  priority?: boolean
}) {
  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-square w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface-1"
        aria-label={`${img.alt} — enlarge`}
      >
        <SmartImage src={img.url} alt={img.alt} sizes={sizes} priority={priority} quality={72} className="object-contain p-2 sm:p-3" />
        <span className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/70 text-off-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand className="h-4 w-4" />
        </span>
      </button>
      {onOrder && (
        <button
          type="button"
          onClick={onOrder}
          className="mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-gold/60 text-xs font-semibold text-foreground transition-colors hover:bg-gold hover:text-charcoal sm:text-sm"
        >
          <MessageCircle className="h-3.5 w-3.5 text-gold-ink" />
          {orderLabel}
        </button>
      )}
    </div>
  )
}

export default function ProjectPage() {
  const { t } = useLocale()
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { items, loading, error } = useWork()
  const [lightbox, setLightbox] = useState<number | null>(null)

  const data = useMemo(() => {
    if (!items) return null
    const item = items.find((i) => i.id === projectId)
    if (!item) return { item: null } as const
    const pieces = withPhotos(items)
    const pos = pieces.findIndex((p) => p.id === item.id)
    const next = pieces.length > 1 ? pieces[(pos + 1) % pieces.length] : undefined
    const parent = item.parentId ? items.find((i) => i.id === item.parentId) : undefined
    const children = withPhotos(items.filter((i) => item.childIds.includes(i.id)))
    return { item, next, parent, children } as const
  }, [items, projectId])

  if (loading || !data) {
    return (
      <PageShell>
        <div className="section">
          <div className="shell">
            <div className="shimmer h-4 w-24 rounded bg-surface-2" />
            <div className="shimmer mt-6 h-16 w-2/3 rounded bg-surface-2" />
            <div className="shimmer mt-10 aspect-[16/9] rounded-[var(--radius)] bg-surface-2" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (error || !data.item) {
    return (
      <PageShell>
        <div className="section">
          <div className="shell text-center">
            <p className="text-title">{t.project.notFound}</p>
            <Link href="/projects" className="btn btn-ink mt-8">{t.project.back}</Link>
          </div>
        </div>
      </PageShell>
    )
  }

  const { item, next, parent, children } = data
  const order = (imageUrl?: string) => {
    const message = [`Hello AWTAD, I'd like to order this piece: ${item.title}`, window.location.href, imageUrl ? `Photo: ${imageUrl}` : ""]
      .filter(Boolean)
      .join("\n")
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer")
  }
  const lightboxImages = item.images.map((i) => ({ id: i.id, name: i.alt, url: i.url }))
  const indexOf = (img: WorkImage) => item.images.indexOf(img)
  const byStage = (s: Stage) => item.images.filter((i) => i.stage === s)
  // The first result photo is the hero; the rest belong to The Result.
  const [hero, ...restResults] = byStage("result")
  const hasProcess = CHAPTERS.slice(0, 3).some((s) => byStage(s).length > 0)
  const chapterLabel: Record<Stage, string> = {
    idea: t.project.idea,
    design: t.project.design,
    craft: t.project.craft,
    result: t.project.result,
  }

  return (
    <PageShell>
      {/* Where am I / what am I looking at */}
      {/* Phones: title → photo → story + actions. Desktop: text left, photo right, all above the fold. */}
      <section className="px-4 pb-6 pt-6 sm:px-6 lg:pb-10 lg:pt-10">
        <div className="shell grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr] xl:gap-x-16">
          <div className="lg:col-start-1 lg:row-start-1">
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/projects" className="group inline-flex min-h-10 items-center gap-2 hover:text-foreground">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                {t.project.back}
              </Link>
              {parent && (
                <>
                  <span aria-hidden>/</span>
                  <Link href={`/projects/${parent.id}`} className="inline-flex min-h-10 items-center capitalize hover:text-foreground">
                    {parent.title.toLowerCase()}
                  </Link>
                </>
              )}
            </nav>
            <p className="eyebrow mt-4 lg:mt-10">{t.categories[item.category]}{item.year ? ` · ${item.year}` : ""}</p>
            <h1 className="text-headline mt-3 capitalize">{item.title.toLowerCase()}</h1>
          </div>

          {(hero ?? item.images[0]) && (
            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <Photo
                img={hero ?? item.images[0]}
                onOpen={() => setLightbox(indexOf(hero ?? item.images[0]))}
                priority
                sizes="(min-width:1024px) 420px, 80vw"
                className="mx-auto max-w-[min(80vw,42svh)] lg:me-0 lg:max-w-[min(100%,calc(100svh-var(--header-h)-9rem),420px)]"
              />
            </div>
          )}

          <div className="lg:col-start-1 lg:row-start-2">
            {item.description && (
              <p className="text-lede max-w-xl whitespace-pre-line text-muted-foreground">{item.description}</p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <button type="button" onClick={() => order(item.cover)} className="btn btn-gold">
                <MessageCircle className="h-4 w-4" />
                {t.project.order}
              </button>
              <Link href={`/customize?type=${TYPE_FOR[item.category]}&ref=${item.id}`} className="btn btn-outline group">
                {t.project.createOwn}
                <ArrowRight className="arrow h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Idea → Design → Craft, shown only when process photos exist */}
      {hasProcess &&
        CHAPTERS.slice(0, 3).map((stage, i) => {
          const imgs = byStage(stage)
          if (!imgs.length) return null
          return (
            <section key={stage} className="section pb-0">
              <div className="shell grid gap-8 lg:grid-cols-[16rem_1fr]">
                <Reveal>
                  <p className="text-xs font-semibold tracking-wider text-gold-ink">0{i + 1}</p>
                  <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.22em]">{chapterLabel[stage]}</h2>
                </Reveal>
                <div className={cn("grid gap-4", imgs.length > 1 && "sm:grid-cols-2")}>
                  {imgs.map((img) => (
                    <Reveal key={img.id}>
                      <Photo img={img} onOpen={() => setLightbox(indexOf(img))} sizes="(min-width:1024px) 20vw, 50vw" className="max-w-[16rem]" />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )
        })}

      {restResults.length > 0 && (
        <section className="section pb-0">
          <div className="shell grid gap-8 lg:grid-cols-[16rem_1fr]">
            <Reveal>
              {hasProcess && <p className="text-xs font-semibold tracking-wider text-gold-ink">04</p>}
              <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.22em]">{t.project.result}</h2>
            </Reveal>
            {/* Thumbnails; the fullscreen viewer is one tap away for detail. */}
            <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {restResults.map((img) => (
                <Reveal as="li" key={img.id}>
                  <Photo
                    img={img}
                    onOpen={() => setLightbox(indexOf(img))}
                    onOrder={() => order(img.url)}
                    orderLabel={t.project.orderShort}
                    sizes="(min-width:1280px) 15vw, (min-width:768px) 22vw, 45vw"
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {children.length > 0 && (
        <section className="section pb-0">
          <div className="shell">
            <Reveal>
              <h2 className="text-headline">{t.project.inCollection}</h2>
            </Reveal>
            <div className="mt-10">
              <WorkGallery items={children} orderable />
            </div>
          </div>
        </section>
      )}

      {/* What next: create your own, or keep browsing */}
      <section className="section">
        <div className="shell grid gap-4 lg:grid-cols-2">
          <Reveal className="theme-dark flex flex-col justify-between gap-10 rounded-[var(--radius)] p-8 sm:p-12">
            <p className="text-lede text-muted-foreground">{t.project.inspired}</p>
            <Link href={`/customize?type=${TYPE_FOR[item.category]}&ref=${item.id}`} className="group inline-flex items-center gap-3 text-3xl font-medium tracking-tight sm:text-4xl">
              <span className="font-editorial text-gold">{t.project.createOwn}</span>
              <ArrowRight className="arrow h-7 w-7 text-gold" />
            </Link>
          </Reveal>
          {next && (
            <Reveal>
              <Link href={`/projects/${next.id}`} className="group relative flex h-full min-h-72 flex-col justify-end overflow-hidden rounded-[var(--radius)] bg-surface-2 p-8 sm:p-12">
                <SmartImage src={next.cover} alt="" sizes="(min-width:1024px) 50vw, 100vw" className="zoom-media object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
                <span className="relative text-off-white">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{t.project.next}</span>
                  <span className="mt-2 flex items-center gap-3 text-2xl font-medium capitalize sm:text-3xl">
                    {next.title.toLowerCase()}
                    <ArrowRight className="arrow h-6 w-6" />
                  </span>
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <Lightbox
        images={lightboxImages}
        index={lightbox}
        caption={item.title}
        onClose={() => setLightbox(null)}
        onOrder={(img) => order(img.url)}
        onIndexChange={setLightbox}
      />
    </PageShell>
  )
}

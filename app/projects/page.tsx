"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/site/page-shell"
import { WorkGallery, WorkGallerySkeleton } from "@/components/sections/work-gallery"
import { FinalCta } from "@/components/sections/final-cta"
import { useWork } from "@/hooks/use-work"
import { useLocale } from "@/lib/i18n"
import { CATEGORIES, WALL_SUBS, parseCategory, type CategoryKey, type WallSub } from "@/lib/site"
import { withPhotos } from "@/lib/work"
import { cn } from "@/lib/utils"

function OurWork() {
  const { t } = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { items, loading, error } = useWork()

  const active = parseCategory(params.get("category"))
  const rawSub = params.get("sub")
  const activeSub = active === "wall-art" && WALL_SUBS.includes(rawSub as WallSub) ? (rawSub as WallSub) : null

  const pieces = withPhotos(items ?? [])
  const counts = new Map<CategoryKey, number>()
  pieces.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1))
  const inCategory = active ? pieces.filter((p) => p.category === active) : pieces
  const shown = activeSub ? inCategory.filter((p) => p.wallSub === activeSub) : inCategory

  const go = (key: CategoryKey | null, sub?: WallSub | null) => {
    const q = key ? `?category=${key}${sub ? `&sub=${sub}` : ""}` : ""
    router.replace(`${pathname}${q}`, { scroll: false })
  }
  const select = (key: CategoryKey | null) => go(key)
  const subCounts = new Map<WallSub, number>()
  if (active === "wall-art") inCategory.forEach((p) => subCounts.set(p.wallSub, (subCounts.get(p.wallSub) ?? 0) + 1))

  const filters: { key: CategoryKey | null; label: string; count: number }[] = [
    { key: null, label: t.work.all, count: pieces.length },
    ...CATEGORIES.map((c) => ({ key: c.key, label: t.categories[c.key], count: counts.get(c.key) ?? 0 })),
  ]

  return (
    <>
      {/* Compact intro so the gallery starts on the first screen, even on laptops and phones. */}
      <section className="px-4 pb-5 pt-8 sm:px-6 sm:pt-12">
        <div className="shell">
          <h1 className="text-headline">{active ? t.categories[active] : t.work.pageTitle}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground sm:text-lg">{active ? t.categoryNote[active] : t.work.pageBody}</p>
        </div>
      </section>

      {/* Filters: sticky under the header, scrollable on phones */}
      <div className="glass sticky top-[var(--header-h)] z-30 border-x-0">
        <div className="shell no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6" role="tablist" aria-label="Categories">
          {filters.map((f) => (
            <button
              key={f.key ?? "all"}
              type="button"
              role="tab"
              aria-selected={active === f.key}
              onClick={() => select(f.key)}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors duration-[var(--dur-fast)]",
                active === f.key
                  ? "border-charcoal bg-charcoal text-off-white"
                  : "border-border-strong hover:border-charcoal"
              )}
            >
              {f.label}
              {!loading && <span className="ms-1.5 text-xs opacity-60">{f.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {active === "wall-art" && (
        <div className="shell no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4 sm:px-6" role="group" aria-label={t.categories["wall-art"]}>
          {WALL_SUBS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={activeSub === k}
              onClick={() => go("wall-art", activeSub === k ? null : k)}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-4 text-sm transition-colors duration-[var(--dur-fast)]",
                activeSub === k ? "border-gold-ink bg-gold/20 font-medium" : "border-border hover:border-border-strong text-muted-foreground"
              )}
            >
              {t.wallSubs[k]}
              {!loading && <span className="ms-1.5 text-xs opacity-60">{subCounts.get(k) ?? 0}</span>}
            </button>
          ))}
        </div>
      )}

      <section className="section pt-6 sm:pt-8">
        <div className="shell">
          {loading ? (
            <WorkGallerySkeleton count={9} />
          ) : error ? (
            <p className="text-muted-foreground">{t.work.empty}</p>
          ) : shown.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-border-strong px-6 py-16 text-center">
              <p className="mx-auto max-w-md text-muted-foreground">{active ? t.work.emptyCollection : t.work.empty}</p>
              <Link href="/customize" className="btn btn-gold mt-6">
                {t.nav.start}
              </Link>
            </div>
          ) : (
            <WorkGallery key={`${active ?? "all"}-${activeSub ?? ""}`} items={shown} priorityCount={4} orderable />
          )}
        </div>
      </section>
    </>
  )
}

export default function ProjectsPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="section"><div className="shell"><WorkGallerySkeleton /></div></div>}>
        <OurWork />
      </Suspense>
      <FinalCta />
    </PageShell>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/components/site/reveal"
import { useLocale } from "@/lib/i18n"
import { MEDIA } from "@/lib/site"
import { cn } from "@/lib/utils"

// The design stage shows the whole finished line work in monochrome rather
// than a tight crop, so every card shows a complete picture.
const IMAGES = [MEDIA.journey.idea, MEDIA.journey.result, MEDIA.journey.craft, MEDIA.journey.result]

/**
 * One real commission shown stage by stage. The signature section: the
 * clearest statement of what AWTAD does that no shop can.
 */
export function JourneySection({ showCta = true }: { showCta?: boolean }) {
  const { t } = useLocale()
  return (
    <section className="section overflow-hidden bg-surface-2" aria-labelledby="journey-title">
      <div className="shell">
        <Reveal className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 id="journey-title" className="text-headline">
            <span className="block">{t.journey.titleA}</span>
            <span className="block text-muted-foreground">{t.journey.titleB}</span>
            <span className="font-editorial block text-gold-ink">{t.journey.titleC}</span>
          </h2>
          <p className="text-lede max-w-sm text-muted-foreground">{t.journey.body}</p>
        </Reveal>

        <ol className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0">
          {t.journey.steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.08} className="relative w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-border bg-surface-1">
                <Image
                  src={IMAGES[i]}
                  alt={`${s.title} — ${s.sub}`}
                  fill
                  sizes="(min-width:1024px) 22vw, 78vw"
                  className={cn("object-contain p-3", i === 1 && "contrast-[1.4] grayscale")}
                />
                {i === 1 && (
                  // Drafting grid over the design stage
                  <span
                    aria-hidden
                    className="absolute inset-0 mix-blend-multiply"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgb(217 175 89 / .35) 1px, transparent 1px), linear-gradient(90deg, rgb(217 175 89 / .35) 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                )}
                <span className="absolute start-3 top-3 rounded-full bg-charcoal/85 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wider text-gold">
                  {s.n}
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.sub}</p>
                </div>
                {i < 3 && <ArrowRight aria-hidden className="arrow mt-1 hidden h-4 w-4 text-gold-ink lg:block" />}
              </div>
            </Reveal>
          ))}
        </ol>

        {showCta && (
          <Reveal className="mt-12">
            <Link href="/customize" className="btn btn-ink group">
              {t.journey.cta}
              <ArrowRight className="arrow h-4 w-4" />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}

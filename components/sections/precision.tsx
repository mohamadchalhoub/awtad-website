"use client"

import { Cog, Gem, Hand, PenTool, Scissors } from "lucide-react"
import { Reveal } from "@/components/site/reveal"
import { SmartImage } from "@/components/smart-image"
import { useLocale } from "@/lib/i18n"
import { MEDIA } from "@/lib/site"

// Same order as t.precision.specs: design, cutting, materials, finishing, made to order.
const ICONS = [PenTool, Scissors, Gem, Hand, Cog]

export function PrecisionSection() {
  const { t } = useLocale()
  return (
    <section className="section" aria-labelledby="precision-title">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-surface-2">
          <SmartImage src={MEDIA.closeUp} alt="Close-up of a laser-cut steel piece standing off the wall" sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
        </Reveal>
        <div>
          <Reveal>
            <p className="eyebrow">{t.precision.eyebrow}</p>
            <h2 id="precision-title" className="text-headline mt-4">{t.precision.title}</h2>
          </Reveal>
          <ul className="mt-10 border-t border-border">
            {t.precision.specs.map((s, i) => {
              const Icon = ICONS[i]
              return (
                <Reveal as="li" key={s.value} delay={i * 0.05} className="flex items-center gap-5 border-b border-border py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong text-gold-ink">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="block text-lg font-medium">{s.value}</span>
                    <span className="block text-sm text-muted-foreground">{s.label}</span>
                  </span>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Reveal } from "@/components/site/reveal"
import { SmartImage } from "@/components/smart-image"
import { useLocale } from "@/lib/i18n"
import { MEDIA } from "@/lib/site"

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
          <dl className="mt-12 grid grid-cols-2 border-t border-border">
            {t.precision.specs.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05} className={`border-b border-border py-8 ${i % 2 === 0 ? "pe-6" : "border-s ps-6"}`}>
                <dt className="text-title">{s.value}</dt>
                <dd className="mt-1 text-sm uppercase tracking-[0.18em] text-muted-foreground">{s.label}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

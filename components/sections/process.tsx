"use client"

import { Check } from "lucide-react"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/sections/section-heading"
import { useLocale } from "@/lib/i18n"

/** Dark five-step process joined by a hairline. */
export function ProcessSection() {
  const { t } = useLocale()
  return (
    <section className="theme-dark section" aria-labelledby="process-title">
      <div className="shell">
        <SectionHeading eyebrow={t.process.eyebrow} title={<span id="process-title">{t.process.title}</span>} />

        <ol className="relative mt-16 grid gap-0 lg:grid-cols-5 lg:gap-6">
          {/* Connecting hairline: vertical on phones, horizontal on desktop */}
          <span aria-hidden className="absolute bottom-6 start-[1.2rem] top-6 w-px bg-gradient-to-b from-gold/70 via-gold/30 to-gold/70 lg:hidden" />
          <span aria-hidden className="absolute inset-x-6 top-[1.2rem] hidden h-px bg-gradient-to-r from-gold/70 via-gold/30 to-gold/70 lg:block" />
          {t.process.steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.06} className="relative flex gap-5 pb-10 last:pb-0 lg:flex-col lg:gap-7 lg:pb-0">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-background text-xs font-semibold tracking-wider text-gold">
                {s.n}
              </span>
              <div className="pt-1.5 lg:pt-0">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">{s.title}</h3>
                <p className="mt-2 max-w-xs text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-16 flex items-center gap-4 border-t border-border pt-8">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-charcoal">
            <Check className="h-4 w-4" />
          </span>
          <p className="text-lg">{t.process.promise}</p>
        </Reveal>
      </div>
    </section>
  )
}

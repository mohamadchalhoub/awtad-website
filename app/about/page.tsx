"use client"

import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { Mark } from "@/components/site/logo"
import { SmartImage } from "@/components/smart-image"
import { FinalCta } from "@/components/sections/final-cta"
import { useLocale } from "@/lib/i18n"
import { MEDIA } from "@/lib/site"

export default function AboutPage() {
  const { t } = useLocale()
  const a = t.about
  return (
    <PageShell>
      <section className="section">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">{a.eyebrow}</p>
            <h1 className="text-headline mt-5">{a.title}</h1>
            <p className="text-lede mt-6 text-muted-foreground">{a.body}</p>
          </div>
          <div className="relative aspect-[4/5] max-h-[min(70svh,640px)] w-full overflow-hidden rounded-[var(--radius)] bg-surface-2 lg:justify-self-end">
            <SmartImage src={MEDIA.finishGold} alt="" priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="theme-dark section">
        <Reveal className="shell flex flex-col items-center text-center">
          <Mark className="h-24 w-auto text-gold" />
          <p className="font-arabic mt-10 text-3xl leading-relaxed sm:text-4xl" dir="rtl" lang="ar">
            البساطة في الفكرة، والدقة في التنفيذ.
          </p>
          <p className="font-editorial mt-4 text-2xl text-muted-foreground sm:text-3xl" lang="en" dir="ltr">
            Simple in concept. Precise in execution.
          </p>
        </Reveal>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal>
            <h2 className="text-headline">{a.valuesTitle}</h2>
          </Reveal>
          <ol className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
            {a.values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.06}>
                <span className="text-xs font-semibold tracking-wider text-gold-ink">0{i + 1}</span>
                <h3 className="text-title mt-3">{v.title}</h3>
                <p className="mt-3 text-muted-foreground">{v.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      <FinalCta />
    </PageShell>
  )
}

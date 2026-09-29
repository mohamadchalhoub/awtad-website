"use client"

import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { JourneySection } from "@/components/sections/journey"
import { ProcessSection } from "@/components/sections/process"
import { PrecisionSection } from "@/components/sections/precision"
import { FinalCta } from "@/components/sections/final-cta"
import { useLocale } from "@/lib/i18n"

export default function HowItsMadePage() {
  const { t } = useLocale()
  return (
    <PageShell>
      <section className="section pb-6">
        <Reveal className="shell">
          <p className="eyebrow">{t.nav.process}</p>
          <h1 className="text-display mt-5 max-w-4xl">{t.process.title}</h1>
          <p className="text-lede mt-6 max-w-xl text-muted-foreground">{t.process.promise}</p>
        </Reveal>
      </section>
      <ProcessSection />
      <JourneySection />
      <PrecisionSection />
      <FinalCta />
    </PageShell>
  )
}

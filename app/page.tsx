"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { PageShell } from "@/components/site/page-shell"
import { SmartImage } from "@/components/smart-image"
import { CategoriesSection } from "@/components/sections/categories"
import { SectionHeading } from "@/components/sections/section-heading"
import { WorkGallery, WorkGallerySkeleton } from "@/components/sections/work-gallery"
import { JourneySection } from "@/components/sections/journey"
import { ProcessSection } from "@/components/sections/process"
import { PrecisionSection } from "@/components/sections/precision"
import { FinalCta } from "@/components/sections/final-cta"
import { useWork } from "@/hooks/use-work"
import { useLocale } from "@/lib/i18n"
import { MEDIA } from "@/lib/site"
import { EASE } from "@/lib/motion"
import { withPhotos } from "@/lib/work"

function Hero() {
  const { t, locale } = useLocale()
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  })

  return (
    <section className="theme-dark relative flex min-h-[100svh] items-end overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <SmartImage
          src={MEDIA.hero}
          alt="AWTAD laser-cut steel Islamic calligraphy wall piece"
          priority
          sizes="100vw"
          quality={75}
          className="object-cover object-[70%_50%] lg:object-[85%_50%]"
        />
      </motion.div>
      {/* Readability: dark from the text side and from below */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/30 to-transparent rtl:bg-gradient-to-l" />

      <div className="shell relative z-10 px-4 pb-16 pt-32 sm:px-6 sm:pb-24">
        <motion.p {...fade(0.05)} className="eyebrow tracking-[0.5em]" dir="ltr">
          AWTAD
        </motion.p>
        <motion.h1 {...fade(0.12)} className="text-display mt-6 max-w-4xl">
          <span className="block">{t.hero.titleA}</span>
          <span className="font-editorial block text-gold">{t.hero.titleB}</span>
        </motion.h1>
        <motion.p
          {...fade(0.22)}
          className="mt-7 max-w-xl text-lg text-off-white/80 sm:text-xl"
        >
          <span className={locale === "en" ? "font-arabic" : ""} dir={locale === "en" ? "rtl" : "ltr"} lang={locale === "en" ? "ar" : "en"}>
            {t.hero.arabicLine}
          </span>
        </motion.p>
        <motion.div {...fade(0.3)} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/projects" className="btn btn-gold group">
            {t.hero.primary}
            <ArrowRight className="arrow h-4 w-4" />
          </Link>
          <Link href="/customize" className="btn btn-outline">
            {t.hero.secondary}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function SelectedWork() {
  const { t } = useLocale()
  const { items, loading, error } = useWork()
  // Individual pieces first; collection parents only fill remaining space.
  const pieces = withPhotos(items ?? [])
  const selected = [...pieces.filter((p) => p.childIds.length === 0), ...pieces.filter((p) => p.childIds.length > 0)].slice(0, 8)

  const viewAll = (
    <Link href="/projects" className="group inline-flex min-h-11 items-center gap-2 font-medium">
      <span className="link-underline">{t.work.viewAll}</span>
      <ArrowRight className="arrow h-4 w-4 text-gold-ink" />
    </Link>
  )

  return (
    <section className="section pt-0" aria-labelledby="work-title">
      <div className="shell">
        <SectionHeading title={<span id="work-title">{t.work.title}</span>} body={t.work.body} action={<div className="hidden md:block">{viewAll}</div>} />
        <div className="mt-14">
          {loading ? (
            <WorkGallerySkeleton />
          ) : error || selected.length === 0 ? (
            <p className="text-muted-foreground">{t.work.empty}</p>
          ) : (
            <WorkGallery items={selected} />
          )}
        </div>
        <div className="md:hidden">{viewAll}</div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <PageShell overlay>
      <Hero />
      <CategoriesSection />
      <SelectedWork />
      <JourneySection />
      <ProcessSection />
      <PrecisionSection />
      <FinalCta />
    </PageShell>
  )
}

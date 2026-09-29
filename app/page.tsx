"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { SmartImage } from "@/components/smart-image"
import { CategoriesSection } from "@/components/sections/categories"
import { SectionHeading } from "@/components/sections/section-heading"
import { WorkCard, WorkGallerySkeleton } from "@/components/sections/work-gallery"
import { PrecisionSection } from "@/components/sections/precision"
import { FinalCta } from "@/components/sections/final-cta"
import { useWork } from "@/hooks/use-work"
import { useLocale } from "@/lib/i18n"
import { MEDIA } from "@/lib/site"
import { EASE } from "@/lib/motion"
import { featured, withPhotos } from "@/lib/work"

/**
 * Warm, light hero: the product photograph is the focus, copy stays short.
 * Text first on phones so the message and both actions are visible immediately.
 */
function Hero() {
  const { t } = useLocale()
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  })

  return (
    <section className="bg-surface-2 pt-[var(--header-h)]">
      <div className="shell grid items-center gap-8 px-4 py-10 sm:px-6 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
        <div>
          <motion.p {...fade(0.03)} className="eyebrow tracking-[0.5em]" dir="ltr">
            AWTAD
          </motion.p>
          <motion.h1 {...fade(0.1)} className="text-display mt-5">
            <span className="block">{t.hero.titleA}</span>
            <span className="font-editorial block text-gold-ink">{t.hero.titleB}</span>
          </motion.h1>
          <motion.p {...fade(0.18)} className="text-lede mt-5 max-w-md text-muted-foreground">
            {t.hero.sub}
          </motion.p>
          <motion.div {...fade(0.26)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/projects" className="btn btn-gold group">
              {t.hero.primary}
              <ArrowRight className="arrow h-4 w-4" />
            </Link>
            <Link href="/customize" className="btn btn-outline">
              {t.hero.secondary}
            </Link>
          </motion.div>
        </div>

        <motion.div {...fade(0.15)} className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius)] bg-surface-3 sm:aspect-[4/3] lg:aspect-square">
          <SmartImage
            src={MEDIA.hero}
            alt="A laser-cut AWTAD steel tree on a walnut base"
            priority
            sizes="(min-width:1024px) 52vw, 100vw"
            quality={78}
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}

function Featured() {
  const { t } = useLocale()
  const { items, loading } = useWork()
  const picks = featured(items ?? [], 8)

  if (!loading && picks.length === 0) return null
  return (
    <section className="section pt-0" aria-labelledby="featured-title">
      <div className="shell">
        <SectionHeading
          title={<span id="featured-title">{t.work.featuredTitle}</span>}
          body={t.work.featuredBody}
          action={
            <Link href="/projects" className="group inline-flex min-h-11 items-center gap-2 font-medium">
              <span className="link-underline">{t.work.shopAll}</span>
              <ArrowRight className="arrow h-4 w-4 text-gold-ink" />
            </Link>
          }
        />
        <div className="mt-12">
          {loading ? (
            <WorkGallerySkeleton count={4} />
          ) : (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-4">
              {picks.map((item, i) => (
                <Reveal as="li" key={item.id} delay={(i % 4) * 0.05}>
                  <WorkCard item={item} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function CustomizeSection() {
  const { t } = useLocale()
  const c = t.customSection
  return (
    <section className="theme-dark section" aria-labelledby="custom-title">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 id="custom-title" className="text-display mt-5">
            <span className="block">{c.titleA}</span>
            <span className="font-editorial block text-gold">{c.titleB}</span>
          </h2>
          <p className="text-lede mt-6 max-w-lg text-muted-foreground">{c.body}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {c.inputs.map((x) => (
              <li key={x} className="rounded-full border border-border-strong px-4 py-1.5 text-sm">
                {x}
              </li>
            ))}
          </ul>
          <Link href="/customize" className="btn btn-gold group mt-10 w-full sm:w-auto">
            {c.cta}
            <ArrowRight className="arrow h-4 w-4" />
          </Link>
        </Reveal>

        {/* One real commission: the client illustration becomes the cut piece. */}
        <Reveal delay={0.1} className="grid grid-cols-2 gap-3">
          {[
            { src: MEDIA.journey.idea, alt: "The client illustration" },
            { src: MEDIA.journey.result, alt: "The finished laser-cut portrait" },
          ].map((im) => (
            <div key={im.src} className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-surface-2">
              <SmartImage src={im.src} alt={im.alt} sizes="(min-width:1024px) 22vw, 45vw" className="object-cover" />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function IslamicFeature() {
  const { t } = useLocale()
  const c = t.islamicFeature
  return (
    <section className="section" aria-labelledby="islamic-title">
      <div className="shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-surface-2 lg:max-h-[46rem]">
          <SmartImage src={MEDIA.islamicRoom} alt="Laser-cut Islamic calligraphy panel mounted on a stone wall" sizes="(min-width:1024px) 42vw, 100vw" className="object-cover" />
        </Reveal>
        <Reveal>
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 id="islamic-title" className="text-headline mt-4">{c.title}</h2>
          <p className="text-lede mt-5 max-w-md text-muted-foreground">{c.body}</p>
          <Link href="/projects?category=islamic" className="btn btn-ink group mt-9 w-full sm:w-auto">
            {c.cta}
            <ArrowRight className="arrow h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function HomeFeature() {
  const { t } = useLocale()
  const { items, loading } = useWork()
  const c = t.homeFeature
  const picks = withPhotos(items ?? []).filter((i) => i.category === "home" && i.childIds.length === 0).slice(0, 4)

  return (
    <section className="section bg-surface-2" aria-labelledby="home-title">
      <div className="shell">
        <SectionHeading eyebrow={c.eyebrow} title={<span id="home-title">{c.title}</span>} body={c.body} />
        <div className="mt-12">
          {loading ? (
            <WorkGallerySkeleton count={4} />
          ) : picks.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-4">
              {picks.map((item, i) => (
                <Reveal as="li" key={item.id} delay={i * 0.05}>
                  <WorkCard item={item} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius)]">
              <SmartImage src={MEDIA.home} alt="Laser-cut desk clock" sizes="100vw" className="object-cover" />
            </div>
          )}
        </div>
        <Link href="/projects?category=home" className="btn btn-ink group mt-10 w-full sm:w-auto">
          {c.cta}
          <ArrowRight className="arrow h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <CategoriesSection />
      <Featured />
      <CustomizeSection />
      <IslamicFeature />
      <HomeFeature />
      <PrecisionSection />
      <FinalCta />
    </PageShell>
  )
}

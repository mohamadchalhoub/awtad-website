"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useContent } from "@/hooks/use-content"
import { AnimatedBackground } from "@/components/animated-background"
import { ProjectCard, ProjectCardSkeleton } from "@/components/project-card"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ArrowRight, ArrowDown, Sparkles } from "lucide-react"
import { EASE, fadeUp, revealChild, stagger, viewport } from "@/lib/motion"
import { SmartImage } from "@/components/smart-image"

interface ProjectWithCover {
  id: number
  title: string
  category: string
  description: string
  year: string
  coverImageId?: string
  coverImageUrl?: string
  parent_id?: number | null
}

/** TODO: confirm these figures with the client before launch. */
const CREDIBILITY = [
  { value: "10+", label: "Years of craft" },
  { value: "500+", label: "Pieces delivered" },
  { value: "5.9K", label: "Community" },
  { value: "100%", label: "Made to order" },
]

export default function HomePage() {
  const { content, isLoading, refreshContent } = useContent()
  const router = useRouter()
  const [projectsWithCover, setProjectsWithCover] = useState<ProjectWithCover[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        setIsLoadingProjects(true)
        const { SupabaseContentService } = await import('@/lib/supabase-content')

        // Load featured projects for homepage
        const featuredProjects = await SupabaseContentService.getFeaturedProjects(6)

        // OPTIMIZATION: Batch fetch all cover images in ONE query
        // ✅ cover_image_id is a string UUID, not a number!
        const coverImageIds = featuredProjects
          .filter(p => p.cover_image_id)
          .map(p => p.cover_image_id!)

        let coverImagesMap = new Map<string, string>()
        if (coverImageIds.length > 0) {
          const { data: imagesData } = await supabase
            .from('images')
            .select('id, url')
            .in('id', coverImageIds)

          if (imagesData) {
            coverImagesMap = new Map(imagesData.map(img => [img.id, img.url]))
          }
        }

        // Map projects with their cover images
        const projectsWithCoverImages = featuredProjects.map(project => ({
          id: project.id,
          title: project.title,
          category: project.category,
          description: project.description,
          year: project.year,
          coverImageId: project.cover_image_id || undefined,
          coverImageUrl: project.cover_image_id ? coverImagesMap.get(project.cover_image_id) : undefined,
          parent_id: project.parent_id
        }))

        setProjectsWithCover(projectsWithCoverImages)
      } catch (error) {
        console.error('Error loading featured projects:', error)
        setProjectsWithCover([])
      } finally {
        setIsLoadingProjects(false)
      }
    }

    loadFeaturedProjects()
  }, [])

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`)
  }

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  // The first featured cover doubles as the hero backdrop, so the page
  // opens on the client's actual work rather than an empty gradient.
  const heroImage = projectsWithCover.find((p) => p.coverImageUrl)?.coverImageUrl

  const heroTitle = content?.homepage?.heroTitle || "Metal, shaped by hand"
  const heroSubtitle = content?.homepage?.heroSubtitle || "Bespoke craft, built to last"
  const heroDescription =
    content?.homepage?.heroDescription ||
    "We take your idea and render it in steel — portraits, calligraphy and custom work made to meet your imagination."

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackground />
      <Navigation />

      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        {/* Backdrop photograph with a very slow push-in */}
        {heroImage && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.4, ease: EASE }}
          >
            <SmartImage
              src={heroImage}
              alt=""
              priority
              sizes="100vw"
              quality={70}
              className="object-cover"
            />
          </motion.div>
        )}

        {/* Scrims: one vertical for text contrast, one radial to focus the centre */}
        <div className="absolute inset-0 bg-background/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/55 to-background" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 0%, var(--background) 100%)",
          }}
        />

        <div className="shell relative z-10 px-6 pb-24 pt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mb-7 flex justify-center"
          >
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="eyebrow !text-foreground/70">
                Handcrafted in Lebanon
              </span>
            </span>
          </motion.div>

          {/* Headline: each line masked and lifted into place */}
          <motion.h1
            className="text-display mx-auto max-w-5xl"
            initial="hidden"
            animate="visible"
            variants={stagger(0.09, 0.25)}
          >
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span variants={revealChild} className="block text-foreground">
                {heroTitle}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span variants={revealChild} className="text-gold-sheen block italic">
                {heroSubtitle}
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            className="text-lede mx-auto mt-8 max-w-2xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
          >
            {heroDescription}
          </motion.p>

          <motion.div
            className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          >
            <Button
              size="lg"
              onClick={() => scrollTo("projects-section")}
              className="gold-gradient group h-13 rounded-full px-8 text-base text-primary-foreground shadow-[var(--shadow-lg)] transition-all duration-[var(--dur-base)] hover:shadow-[0_10px_40px_var(--primary-glow)]"
            >
              Explore our work
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-[var(--dur-base)] group-hover:translate-x-1" />
            </Button>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border-strong bg-transparent px-8 text-base backdrop-blur-sm transition-colors duration-[var(--dur-base)] hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              >
                Our story
              </Button>
            </Link>
          </motion.div>

          {/* Credibility strip */}
          <motion.dl
            className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-border/60 pt-10 sm:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={stagger(0.07, 1.05)}
          >
            {CREDIBILITY.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <dt className="text-gold font-display text-3xl font-semibold sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>

        {/* Scroll cue */}
        <motion.button
          type="button"
          aria-label="Scroll to services"
          onClick={() => scrollTo("services-section")}
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-muted-foreground transition-colors hover:text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <motion.span
            className="block"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-5 w-5" />
          </motion.span>
        </motion.button>
      </section>

      {/* ========================== SERVICES ========================== */}
      <section id="services-section" className="section relative">
        <div className="shell">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger()}
          >
            <motion.p variants={fadeUp} className="eyebrow">
              What we do
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-headline mt-4">
              Craft, <span className="text-gold italic">end to end</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-muted-foreground">
              From first sketch to final finish, every piece is designed, cut and
              hand-finished in our workshop.
            </motion.p>
            <motion.hr variants={fadeUp} className="rule-gold mx-auto mt-9 w-28" />
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger()}
          >
            {content?.homepage?.services?.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1/80 p-8 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[var(--shadow-xl)]"
              >
                {/* Gold wash that blooms from the top on hover */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/12 to-transparent opacity-0 transition-opacity duration-[var(--dur-slow)] group-hover:opacity-100" />

                <span className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-2xl transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:scale-110">
                  {service.icon}
                </span>

                <h3 className="relative mt-6 text-xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="relative mt-3 leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <span className="relative mt-6 block h-px w-10 bg-primary/40 transition-all duration-[var(--dur-slow)] ease-[var(--ease-out-soft)] group-hover:w-20" />
              </motion.div>
            ))}

            {/* Skeletons while the content provider resolves */}
            {!content?.homepage?.services &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-border bg-surface-1/60 p-8"
                >
                  <div className="shimmer h-14 w-14 rounded-xl bg-surface-2" />
                  <div className="shimmer mt-6 h-5 w-1/2 rounded bg-surface-2" />
                  <div className="shimmer mt-4 h-3.5 w-full rounded bg-surface-2" />
                  <div className="shimmer mt-2 h-3.5 w-3/4 rounded bg-surface-2" />
                </div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* ========================== PROJECTS ========================== */}
      <section id="projects-section" className="section relative">
        <div className="shell">
          <motion.div
            className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger()}
          >
            <div className="max-w-xl">
              <motion.p variants={fadeUp} className="eyebrow">
                Selected work
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-headline mt-4">
                Featured <span className="text-gold italic">pieces</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-lg text-muted-foreground">
                A small selection from the workshop. Each one made once, for one
                person.
              </motion.p>
            </div>

            <motion.div variants={fadeUp}>
              <Link
                href="/projects"
                className="link-underline group inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                View the full portfolio
                <ArrowRight className="h-4 w-4 transition-transform duration-[var(--dur-base)] group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger()}
          >
            {isLoadingProjects ? (
              Array.from({ length: 6 }).map((_, index) => (
                <ProjectCardSkeleton key={index} aspect="portrait" />
              ))
            ) : projectsWithCover.length > 0 ? (
              projectsWithCover.slice(0, 6).map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleProjectClick}
                  aspect="portrait"
                  priority={index < 3}
                />
              ))
            ) : (
              <motion.div
                variants={fadeUp}
                className="col-span-full rounded-2xl border border-dashed border-border py-20 text-center"
              >
                <Sparkles className="mx-auto h-8 w-8 text-primary/50" />
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  Nothing featured just yet
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                  New pieces are added as they leave the workshop. The full
                  portfolio is always available.
                </p>
                <Link href="/projects">
                  <Button
                    variant="outline"
                    className="mt-7 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Browse all work
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============================ CTA ============================= */}
      <section className="section relative">
        <div className="shell">
          <motion.div
            className="steel-texture grain relative overflow-hidden rounded-3xl border border-primary/20 bg-surface-1 px-8 py-20 text-center sm:px-16"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 0%, var(--primary-muted) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="eyebrow">Commissions open</p>
              <h2 className="text-headline mx-auto mt-4 max-w-2xl">
                Tell us what you imagine.{" "}
                <span className="text-gold italic">We'll forge it.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
                Every commission starts with a conversation. Share the idea and
                we'll come back with a plan, a timeline and a price.
              </p>
              <Link href="/about">
                <Button
                  size="lg"
                  className="gold-gradient group mt-9 h-13 rounded-full px-9 text-base text-primary-foreground shadow-[var(--shadow-lg)] transition-all duration-[var(--dur-base)] hover:shadow-[0_10px_40px_var(--primary-glow)]"
                >
                  Start a commission
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-[var(--dur-base)] group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

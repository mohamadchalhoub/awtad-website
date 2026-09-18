"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"
import { fadeUp } from "@/lib/motion"
import { SmartImage } from "@/components/smart-image"

export interface ProjectCardProject {
  id: number
  title: string
  category?: string
  description?: string
  year?: string
  coverImageUrl?: string
}

interface ProjectCardProps {
  project: ProjectCardProject
  onOpen: (id: number) => void
  /** Rendered under the description — used for the subproject strip. */
  children?: ReactNode
  /** Rendered at the very bottom — used for View Details / Share. */
  actions?: ReactNode
  /** 16/9 on dense grids, 4/5 for the editorial homepage grid. */
  aspect?: "video" | "portrait"
  priority?: boolean
}

/**
 * The single card used everywhere a project is shown.
 *
 * Previously the homepage and /projects had two unrelated card
 * implementations with different radii, shadows, padding and borders,
 * which made them look like two different websites.
 */
export function ProjectCard({
  project,
  onOpen,
  children,
  actions,
  aspect = "video",
  priority = false,
}: ProjectCardProps) {
  return (
    <motion.article
      variants={fadeUp}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-[var(--shadow-md)] transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[var(--shadow-xl)]"
    >
      {/* Gold hairline that traces the top edge on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-all duration-[var(--dur-slow)] ease-[var(--ease-out-soft)] group-hover:scale-x-100 group-hover:opacity-100" />

      <button
        type="button"
        onClick={() => onOpen(project.id)}
        aria-label={`Open ${project.title}`}
        className={`relative block w-full overflow-hidden bg-surface-2 ${
          aspect === "portrait" ? "aspect-[4/5]" : "aspect-[16/10]"
        }`}
      >
        <SmartImage
          src={project.coverImageUrl}
          alt={project.title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-[900ms] ease-[var(--ease-out-soft)] will-change-transform group-hover:scale-[1.06]"
          fallback={
            <div className="steel-texture flex h-full w-full items-center justify-center bg-surface-2">
              <span className="font-display text-3xl text-muted-foreground/50">
                {project.title?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
          }
        />

        {/* Scrim: idle at low opacity for badge legibility, deepens on hover */}
        <span className="scrim pointer-events-none absolute inset-0 opacity-55 transition-opacity duration-[var(--dur-base)] group-hover:opacity-85" />

        {/* Meta badges */}
        <span className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
          {project.category && (
            <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-md">
              {project.category}
            </span>
          )}
          {project.year && (
            <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/75 backdrop-blur-md">
              {project.year}
            </span>
          )}
        </span>

        {/* Corner affordance, rises in on hover */}
        <span className="pointer-events-none absolute bottom-3 right-3 z-10 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-primary/40 bg-black/50 text-primary opacity-0 backdrop-blur-md transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3
          onClick={() => onOpen(project.id)}
          className="cursor-pointer text-lg font-semibold leading-snug text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-primary"
        >
          {project.title}
        </h3>

        {project.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}

        {children}

        {actions && <div className="mt-auto pt-3">{actions}</div>}
      </div>
    </motion.article>
  )
}

/** Matching skeleton, so loading state shares the card's geometry exactly. */
export function ProjectCardSkeleton({
  aspect = "video",
}: {
  aspect?: "video" | "portrait"
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
      <div
        className={`shimmer bg-surface-2 ${
          aspect === "portrait" ? "aspect-[4/5]" : "aspect-[16/10]"
        }`}
      />
      <div className="space-y-3 p-5">
        <div className="shimmer h-5 w-3/4 rounded bg-surface-2" />
        <div className="shimmer h-3.5 w-full rounded bg-surface-2" />
        <div className="shimmer h-3.5 w-2/3 rounded bg-surface-2" />
      </div>
    </div>
  )
}

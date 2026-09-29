"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { EASE } from "@/lib/motion"
import { MessageCircle } from "lucide-react"
import { SmartImage } from "@/components/smart-image"
import { whatsappUrl } from "@/lib/site"
import { useLocale } from "@/lib/i18n"
import type { WorkItem } from "@/lib/work"
import { cn } from "@/lib/utils"

/**
 * Every piece sits whole inside the same square frame (contain, never crop),
 * so the grid reads evenly and nothing looks zoomed in. Two columns on
 * phones, up to four on wide screens.
 */
const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4"

export function WorkCard({ item, priority }: { item: WorkItem; priority?: boolean }) {
  const { t } = useLocale()
  return (
    <Link href={`/projects/${item.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-border bg-surface-1 transition-colors duration-[var(--dur-base)] group-hover:border-border-strong">
        <SmartImage
          src={item.cover}
          alt={item.title}
          priority={priority}
          quality={72}
          sizes="(min-width:1280px) 22vw, (min-width:768px) 31vw, 48vw"
          className="object-contain p-2 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.02] sm:p-3"
        />
        {item.childIds.length > 0 && (
          <span className="absolute start-2 top-2 rounded-full bg-charcoal/85 px-2 py-0.5 text-[0.65rem] font-medium text-off-white sm:start-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[0.7rem]">
            {t.work.collection}
          </span>
        )}
      </div>
      <h3 className="mt-2.5 line-clamp-1 text-sm font-medium capitalize sm:mt-3 sm:text-base">{item.title.toLowerCase()}</h3>
      <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">{t.categories[item.category]}</p>
    </Link>
  )
}

function orderItem(item: WorkItem) {
  const message = [
    `Hello AWTAD, I'd like to order this piece: ${item.title}`,
    `${window.location.origin}/projects/${item.id}`,
    item.cover ? `Photo: ${item.cover}` : "",
  ]
    .filter(Boolean)
    .join("\n")
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer")
}

export function WorkGallery({
  items,
  priorityCount = 0,
  orderable = false,
}: {
  items: WorkItem[]
  priorityCount?: number
  /** Show a WhatsApp "Order this" button under every card. */
  orderable?: boolean
}) {
  const { t } = useLocale()
  return (
    <ul className={GRID}>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: EASE }}
        >
          <WorkCard item={item} priority={i < priorityCount} />
          {orderable && (
            <button
              type="button"
              onClick={() => orderItem(item)}
              className="mt-2.5 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-gold/60 text-xs font-semibold transition-colors hover:bg-gold hover:text-charcoal sm:text-sm"
            >
              <MessageCircle className="h-3.5 w-3.5 text-gold-ink" />
              {t.project.orderShort}
            </button>
          )}
        </motion.li>
      ))}
    </ul>
  )
}

export function WorkGallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={GRID} aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className={cn("shimmer aspect-square rounded-[var(--radius)] bg-surface-2")} />
          <div className="shimmer mt-3 h-4 w-2/3 rounded bg-surface-2" />
        </li>
      ))}
    </ul>
  )
}

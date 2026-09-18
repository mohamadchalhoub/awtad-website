"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink, X } from "lucide-react"
import { EASE } from "@/lib/motion"
import { SmartImage } from "@/components/smart-image"

export const AWTAD_WHATSAPP = "96171175906"

export interface OrderRequest {
  imageUrl: string
  imageName: string
  projectTitle?: string
  projectCategory?: string
  projectYear?: string
  price?: number
  pageUrl: string
}

/**
 * Builds the WhatsApp message.
 *
 * Kept deliberately short. The previous version pasted a ten-line block of
 * bulleted "PROJECT DETAILS" with file sizes and emoji headers into the chat,
 * which reads like a system dump rather than a person enquiring. The team can
 * see the rest by opening the link.
 */
export function buildOrderMessage(order: OrderRequest) {
  const lines = [
    "Hello AWTAD,",
    "",
    `I'd like to order this piece: ${order.projectTitle || order.imageName}`,
  ]
  if (order.projectCategory) lines.push(`Category: ${order.projectCategory}`)
  if (order.price && order.price > 0) lines.push(`Listed price: $${order.price.toFixed(2)}`)
  lines.push("", `Reference: ${order.pageUrl}`, "", "Could you share pricing and availability?")
  return lines.join("\n")
}

export function whatsappLink(order: OrderRequest) {
  return `https://wa.me/${AWTAD_WHATSAPP}?text=${encodeURIComponent(buildOrderMessage(order))}`
}

/**
 * Order confirmation sheet.
 *
 * Replaces a dialog that showed a green "WhatsApp Details" alert box, a blue
 * "Image Reference" alert box, and the raw message in a <pre> — none of which
 * matched the site and all of which asked the visitor to read before acting.
 * This shows the piece they picked, a short summary, and one obvious button.
 */
export function WhatsAppOrderDialog({
  order,
  onClose,
}: {
  order: OrderRequest | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = order ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [order])

  useEffect(() => {
    if (!order) return
    setCopied(false)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [order, onClose])

  const copy = async () => {
    if (!order) return
    try {
      await navigator.clipboard.writeText(buildOrderMessage(order))
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard unavailable — the WhatsApp link still carries the message */
    }
  }

  const rows = order
    ? [
        ["Piece", order.projectTitle || order.imageName],
        ...(order.projectCategory ? [["Category", order.projectCategory]] : []),
        ...(order.projectYear ? [["Year", order.projectYear]] : []),
        ...(order.price && order.price > 0
          ? [["Listed price", `$${order.price.toFixed(2)}`]]
          : []),
      ]
    : []

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
            className="panel relative my-8 w-full max-w-md overflow-hidden rounded-3xl"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.36, ease: EASE }}
          >
            {/* The piece being ordered, so there is no doubt what this is about */}
            <div className="steel-texture relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
              {/* Optimized rendition with fallback — the full-size original can
                  take seconds, and an empty header reads as a broken dialog. */}
              <SmartImage
                src={order.imageUrl}
                alt={order.imageName}
                sizes="448px"
                quality={70}
                priority
                className="object-cover"
              />
              {/* Two scrims: a soft full-height one for depth, and a hard one
                  behind the caption so white type holds up over a light photo. */}
              <span className="scrim pointer-events-none absolute inset-0 opacity-75" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="eyebrow !text-primary">Order enquiry</p>
                <h3
                  id="order-dialog-title"
                  className="mt-1.5 font-display text-2xl font-semibold text-white"
                >
                  {order.projectTitle || order.imageName}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <dl className="divide-y divide-border/70 rounded-2xl border border-border bg-surface-2/50">
                {rows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 px-4 py-3"
                  >
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="min-w-0 truncate text-right text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                We&apos;ll open WhatsApp with your enquiry ready to send to the
                AWTAD team.
              </p>

              <a
                href={whatsappLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-[15px] font-semibold text-black shadow-[var(--shadow-md)] transition-all duration-[var(--dur-base)] hover:brightness-110 hover:shadow-[0_8px_30px_rgba(37,211,102,0.35)]"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                Continue on WhatsApp
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>

              <button
                type="button"
                onClick={copy}
                className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy the message instead
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-muted-foreground/70">
                +961 71 175 906
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.465 3.49" />
    </svg>
  )
}

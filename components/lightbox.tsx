"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minimize2,
  X,
  ZoomIn,
} from "lucide-react"
import { EASE } from "@/lib/motion"

/**
 * Small, already-cached renditions served by the Next.js optimizer.
 *
 * The grid has usually fetched these already, so the viewer can show a
 * recognisable frame instantly instead of a black void while the full-size
 * original downloads. Hosts outside remotePatterns fall back to the original.
 */
function rendition(url: string, w: number, q: number) {
  try {
    if (!/\.public\.blob\.vercel-storage\.com$/.test(new URL(url).hostname)) return url
  } catch {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${q}`
}

/**
 * An <img> that asks the optimizer for a rendition and silently falls back to
 * the original URL if that fails. The optimizer abandons upstreams slower than
 * ~7s with a 500, which is reachable on a poor link to blob storage — without
 * this fallback the viewer would show nothing at all in exactly the case where
 * the visitor most needs to see something.
 */
function RenditionImg({
  url,
  w,
  q,
  className,
  style,
  alt,
  onSettled,
  onClick,
  ...rest
}: {
  url: string
  w: number
  q: number
  className?: string
  style?: React.CSSProperties
  alt: string
  onSettled?: () => void
  onClick?: () => void
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "onClick" | "style">) {
  const [src, setSrc] = useState(() => rendition(url, w, q))

  // A new image in the same slot must reset to its own optimized rendition.
  useEffect(() => {
    setSrc(rendition(url, w, q))
  }, [url, w, q])

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onLoad={onSettled}
      onError={() => {
        if (src !== url) setSrc(url)
        else onSettled?.()
      }}
    />
  )
}

export interface LightboxImage {
  id: string
  name: string
  url: string
}

interface LightboxProps {
  images: LightboxImage[]
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
  /** Rendered as the primary action; omitted if not supplied. */
  onOrder?: (image: LightboxImage) => void
  /** Shown under the filename, e.g. the project title. */
  caption?: string
}

/**
 * Full-bleed image viewer.
 *
 * Replaces a shadcn Dialog that was fighting its own max-width to fake a
 * fullscreen layer. This renders its own fixed overlay so the photograph
 * genuinely fills the viewport, and adds what a gallery of several images
 * needs: direction-aware transitions, side arrows, a thumbnail filmstrip,
 * keyboard and swipe navigation, click-to-zoom, and neighbour preloading so
 * paging through doesn't flash empty frames.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
  onOrder,
  caption,
}: LightboxProps) {
  const open = index !== null && index >= 0 && index < images.length
  const [direction, setDirection] = useState(1)
  const [zoomed, setZoomed] = useState(false)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const filmstripRef = useRef<HTMLDivElement>(null)

  const many = images.length > 1

  const go = useCallback(
    (delta: number) => {
      if (index === null || !many) return
      setDirection(delta)
      setZoomed(false)
      onIndexChange((index + delta + images.length) % images.length)
    },
    [index, images.length, many, onIndexChange]
  )

  // Keyboard control.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) setZoomed(false)
        else onClose()
      } else if (e.key === "ArrowLeft") go(-1)
      else if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, go, onClose, zoomed])

  // Freeze the page behind the overlay.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Warm the neighbours so paging is instant.
  useEffect(() => {
    if (!open || index === null || !many) return
    for (const delta of [-1, 1]) {
      const neighbour = images[(index + delta + images.length) % images.length]
      if (neighbour) {
        const img = new window.Image()
        img.src = rendition(neighbour.url, 1200, 80)
      }
    }
  }, [open, index, images, many])

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!open || index === null) return
    filmstripRef.current
      ?.querySelector(`[data-thumb="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [open, index])

  if (!open || index === null) return null
  const current = images[index]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col bg-black/94 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label={`Image viewer: ${current.name}`}
      >
        {/* ---------------- Top bar ---------------- */}
        <div className="relative z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            {caption && (
              <p className="truncate text-[11px] uppercase tracking-[0.18em] text-white/50">
                {caption}
              </p>
            )}
            {many && (
              <p className="mt-1 text-sm tabular-nums text-white/80">
                {index + 1}{" "}
                <span className="text-white/40">/ {images.length}</span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onOrder && (
              <button
                type="button"
                onClick={() => onOrder(current)}
                className="gold-gradient flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium text-primary-foreground shadow-lg transition-shadow hover:shadow-[0_8px_30px_var(--primary-glow)]"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Order via WhatsApp</span>
                <span className="sm:hidden">Order</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? "Fit to screen" : "Zoom in"}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:flex"
            >
              {zoomed ? <Minimize2 className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ---------------- Stage ---------------- */}
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
          onClick={(e) => {
            // Clicking the backdrop closes; clicking the photo does not.
            if (e.target === e.currentTarget) onClose()
          }}
          onTouchStart={(e) => {
            touchStart.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            }
          }}
          onTouchEnd={(e) => {
            if (!touchStart.current) return
            const dx = e.changedTouches[0].clientX - touchStart.current.x
            const dy = e.changedTouches[0].clientY - touchStart.current.y
            // Horizontal intent only, so vertical scrolling a zoomed image works.
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? -1 : 1)
            touchStart.current = null
          }}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 48, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -48, scale: 0.98 }}
              transition={{ duration: 0.34, ease: EASE }}
              className="relative flex max-h-full max-w-full items-center justify-center"
            >
              {/* Low-res frame first — usually already cached by the grid */}
              <RenditionImg
                url={current.url}
                w={640}
                q={45}
                alt=""
                aria-hidden="true"
                className={`max-h-[86vh] max-w-full object-contain blur-lg transition-opacity duration-500 ${
                  loaded[current.id] ? "opacity-0" : "opacity-100"
                }`}
              />

              {/* Full-size image fades over it once decoded */}
              <RenditionImg
                url={current.url}
                w={1920}
                q={82}
                alt={current.name}
                onSettled={() => setLoaded((m) => ({ ...m, [current.id]: true }))}
                onClick={() => setZoomed((z) => !z)}
                className={`absolute inset-0 m-auto transition-opacity duration-500 ${
                  loaded[current.id] ? "opacity-100" : "opacity-0"
                } ${
                  zoomed
                    ? "max-h-none w-auto cursor-zoom-out"
                    : "max-h-[86vh] max-w-full cursor-zoom-in object-contain"
                }`}
                style={zoomed ? { maxWidth: "none", height: "auto" } : undefined}
              />

              {/* Spinner while the first frame is still on the wire */}
              {!loaded[current.id] && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Side arrows */}
          {many && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/85 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/75 hover:text-white sm:left-4 sm:h-14 sm:w-14"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/85 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/75 hover:text-white sm:right-4 sm:h-14 sm:w-14"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* ---------------- Filmstrip ---------------- */}
        {many && (
          <div
            ref={filmstripRef}
            className="relative z-20 flex shrink-0 items-center gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6"
          >
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                data-thumb={i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1)
                  setZoomed(false)
                  onIndexChange(i)
                }}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-[var(--dur-base)] ${
                  i === index
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-45 hover:opacity-80"
                }`}
              >
                <RenditionImg
                  url={image.url}
                  w={256}
                  q={55}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

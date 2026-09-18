"use client"

import Image from "next/image"
import { useState } from "react"

/**
 * Image wrapper that routes through the Next.js optimizer, with a two-stage
 * fallback.
 *
 * next.config.mjs already enables optimization and allows the Vercel Blob
 * host, but every image on the site was a raw <img>, so the optimizer was
 * never reached and browsers pulled the full-size originals — measured at
 * 0.2–1.6 MB each on /projects, with several still in flight 20s after load.
 * Going through next/image serves a resized WebP/AVIF sized to the slot
 * instead, which measured at 2–9 KB.
 *
 * The fallback chain matters. Next's optimizer gives up on an upstream that
 * takes longer than ~7s and returns a 500; on a slow link to blob storage
 * that is reachable in practice. Rather than show a hole where the photo
 * should be, a failed optimize retries as a plain <img> against the original
 * URL — slower, but the visitor still sees the work. Only if that also fails
 * do we show the monogram placeholder.
 *
 * Hosts outside remotePatterns would make next/image throw, so anything
 * unrecognised skips straight to the plain <img> path.
 */
const OPTIMIZABLE = [/\.public\.blob\.vercel-storage\.com$/]

function canOptimize(src?: string) {
  if (!src) return false
  if (src.startsWith("/")) return true
  try {
    return OPTIMIZABLE.some((re) => re.test(new URL(src).hostname))
  } catch {
    return false
  }
}

interface SmartImageProps {
  src?: string
  alt: string
  className?: string
  /** Slot width hint for the optimizer. Get this right — it decides the bytes. */
  sizes?: string
  priority?: boolean
  /** Rendered only once both the optimized and the direct URL have failed. */
  fallback?: React.ReactNode
  quality?: number
}

type Stage = "optimized" | "direct" | "failed"

export function SmartImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  fallback = null,
  quality = 78,
}: SmartImageProps) {
  const [stage, setStage] = useState<Stage>(() =>
    canOptimize(src) ? "optimized" : "direct"
  )

  if (!src || stage === "failed") return <>{fallback}</>

  if (stage === "optimized") {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onError={() => setStage("direct")}
        className={className}
      />
    )
  }

  // Unoptimized path. `fill` semantics are emulated so swapping stages does
  // not change the element's box — the parent is already positioned.
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setStage("failed")}
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  )
}

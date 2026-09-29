import { MARK_PATH, MARK_VIEWBOX } from "@/lib/brand-mark"
import { cn } from "@/lib/utils"

/** The traced AWTAD calligraphic mark. Inherits colour from `currentColor`. */
export function Mark({ className, title = "AWTAD" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} className={cn("shrink-0", className)} role="img" aria-label={title}>
      <path fill="currentColor" d={MARK_PATH} />
    </svg>
  )
}

/** Header lockup: gold mark with the Latin name set in the UI face. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)} dir="ltr">
      <Mark className="h-9 w-auto text-gold-ink sm:h-10" />
      <span className="text-[0.95rem] font-semibold tracking-[0.32em] text-current">AWTAD</span>
    </span>
  )
}

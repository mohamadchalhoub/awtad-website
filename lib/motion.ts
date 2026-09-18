import type { Variants, Transition } from "framer-motion"

/**
 * One easing curve and three durations for the whole site.
 * Mirrors the --ease-* / --dur-* tokens in globals.css so CSS and
 * Framer Motion animations feel like the same hand.
 */
export const EASE = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export const DUR = {
  fast: 0.18,
  base: 0.32,
  slow: 0.62,
} as const

export const transition: Transition = { duration: DUR.slow, ease: EASE }
export const transitionBase: Transition = { duration: DUR.base, ease: EASE }

/** Reveal used by nearly every block on the site. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition },
}

/**
 * Grid/list container. 60ms between children means a six-card grid
 * resolves in well under half a second — the previous `delay: index * 0.2`
 * left the last card waiting 1.2s, which read as slowness rather than polish.
 */
export const stagger = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
})

/** Per-word or per-line headline reveal. */
export const revealChild: Variants = {
  hidden: { opacity: 0, y: "60%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.85, ease: EASE },
  },
}

/** Standard viewport config: animate once, trigger slightly before fully visible. */
export const viewport = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" } as const

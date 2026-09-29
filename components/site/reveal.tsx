"use client"

import { motion } from "framer-motion"
import { EASE } from "@/lib/motion"

/**
 * Gentle fade-and-rise as a block enters the viewport. Short and
 * non-blocking: content is always interactive, the motion is decoration.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: "div" | "li" | "section"
}) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

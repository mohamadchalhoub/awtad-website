"use client"

import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up" 
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation()

  const getDirectionalVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: {
          duration: 0.8,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94] as const
        }
      }
    }

    switch (direction) {
      case "up":
        return {
          ...baseVariants,
          hidden: { ...baseVariants.hidden, y: 50 },
          visible: { ...baseVariants.visible, y: 0 }
        }
      case "down":
        return {
          ...baseVariants,
          hidden: { ...baseVariants.hidden, y: -50 },
          visible: { ...baseVariants.visible, y: 0 }
        }
      case "left":
        return {
          ...baseVariants,
          hidden: { ...baseVariants.hidden, x: 50 },
          visible: { ...baseVariants.visible, x: 0 }
        }
      case "right":
        return {
          ...baseVariants,
          hidden: { ...baseVariants.hidden, x: -50 },
          visible: { ...baseVariants.visible, x: 0 }
        }
      default:
        return baseVariants
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={getDirectionalVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCard({ 
  children, 
  className = "", 
  delay = 0,
  hover = true 
}: AnimatedSectionProps & { hover?: boolean }) {
  const { ref, isInView } = useScrollAnimation()

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94] as const
          }
        }
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  )
}

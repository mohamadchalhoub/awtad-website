"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useRef } from "react"

/**
 * Ambient backdrop: a warm gold aurora, a slow drifting dust field on a
 * 2D canvas, and a cursor-tracked glow.
 *
 * Deliberately canvas-2D rather than WebGL/three.js — it costs no extra
 * dependency and a couple of KB, where an equivalent three.js scene would
 * add ~500KB to first load for a decorative layer.
 *
 * Three things the previous version got wrong, fixed here:
 *  - the cursor glow ran `setState` on every mousemove, re-rendering the
 *    whole page tree; it now writes to motion values, which never re-render
 *  - particle positions came from `Math.random()` during render, so server
 *    and client markup disagreed; the canvas seeds them after mount
 *  - the animation ran forever; it now stops on hidden tabs and for anyone
 *    who prefers reduced motion
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)
  const glowX = useSpring(mouseX, { stiffness: 60, damping: 22, mass: 0.6 })
  const glowY = useSpring(mouseY, { stiffness: 60, damping: 22, mass: 0.6 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 260)
      mouseY.set(e.clientY - 260)
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let frame = 0
    let running = true

    type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number }
    let motes: Mote[] = []

    const seed = () => {
      // Particle count scales with viewport area so phones don't pay for
      // a density that only makes sense on a desktop canvas.
      const count = Math.min(90, Math.round((width * height) / 26000))
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.22 + 0.04),
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2,
      }))
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        m.tw += 0.02

        // Wrap rather than respawn, so density stays constant.
        if (m.y < -10) {
          m.y = height + 10
          m.x = Math.random() * width
        }
        if (m.x < -10) m.x = width + 10
        if (m.x > width + 10) m.x = -10

        const twinkle = 0.65 + Math.sin(m.tw) * 0.35
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 168, 83, ${m.a * twinkle})`
        ctx.fill()
      }
      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)

    if (!reduceMotion) {
      frame = requestAnimationFrame(draw)
    } else {
      draw()
      cancelAnimationFrame(frame)
    }

    // Idle tabs shouldn't burn battery on a decorative layer.
    const handleVisibility = () => {
      if (document.hidden && running) {
        cancelAnimationFrame(frame)
        running = false
      } else if (!document.hidden && !running && !reduceMotion) {
        running = true
        frame = requestAnimationFrame(draw)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none grain">
      {/* Warm base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Gold aurora, drifting slowly behind everything */}
      <motion.div
        className="absolute -top-[30%] -left-[15%] w-[70vw] h-[70vw] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent) 0%, transparent 65%)",
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[25%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold-600) 18%, transparent) 0%, transparent 65%)",
        }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fine architectural grid, barely there */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
        }}
      />

      {/* Drifting gold dust */}
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* Cursor glow — driven by motion values, so it never re-renders React */}
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full hidden md:block"
        style={{
          x: glowX,
          y: glowY,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 12%, transparent) 0%, transparent 60%)",
        }}
      />
    </div>
  )
}

"use client"

import { motion, useReducedMotion } from "motion/react"

/**
 * The room behind every screen. Warm light drifts slowly across a faint lattice of lantern ribs. The lattice
 * is there on purpose: glass bends what is behind it, and straight lines make the bend visible at the edges.
 * Fixed and behind everything; it never carries information.
 */
export function Backdrop() {
  const reduce = useReducedMotion()
  const drift = (x: number, y: number, seconds: number) =>
    reduce ? {} : { animate: { x: [0, x, 0], y: [0, y, 0] }, transition: { duration: seconds, repeat: Infinity, ease: "easeInOut" as const } }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(241,217,166,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(241,217,166,0.07) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />
      <motion.div
        className="spill left-[-8%] top-[52%] h-[420px] w-[560px] opacity-[0.26]"
        {...drift(90, -50, 18)}
      />
      <motion.div
        className="spill right-[-6%] top-[2%] h-[380px] w-[520px] opacity-[0.2]"
        {...drift(-70, 60, 22)}
      />
      <motion.div
        className="spill left-[38%] top-[70%] h-[300px] w-[420px] opacity-[0.14]"
        {...drift(60, 40, 26)}
      />
    </div>
  )
}

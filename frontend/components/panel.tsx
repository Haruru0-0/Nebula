"use client"

import type React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

/** A calm, near-solid surface for dense content. Glass is for chrome; this is for reading. */
export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card text-card-foreground", className)} {...props}>
      {children}
    </div>
  )
}

/** A glass panel for floating chrome and the auth forms. It rises into place with a spring. */
export function GlassPanel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cn("glass text-foreground", className)}
      initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 17 }}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

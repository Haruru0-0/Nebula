"use client"

import { useEffect } from "react"
import { animate, motion, useMotionValue, useTransform } from "motion/react"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

/** A whole number that counts to its new value instead of jumping. With reduced motion it just changes. */
export function Count({ value, reduce = false }: { value: number; reduce?: boolean }) {
  const mv = useMotionValue(reduce ? value : 0)
  const text = useTransform(mv, (v) => fmt(v))
  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, reduce, mv])
  return <motion.span>{text}</motion.span>
}

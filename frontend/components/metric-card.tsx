"use client"

import type { LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Panel } from "./panel"
import { Count } from "./count"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  const reduce = useReducedMotion() ?? false
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""))
  const countable = Number.isInteger(n) && String(value).trim() !== ""
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
    >
      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
          {countable ? <Count value={n} reduce={reduce} /> : value}
        </p>
        {trend && (
          <p className="mt-3 text-sm text-muted-foreground">
            {trend.isPositive ? "Up" : "Down"} {Math.abs(trend.value)}% on the previous period
          </p>
        )}
      </Panel>
    </motion.div>
  )
}

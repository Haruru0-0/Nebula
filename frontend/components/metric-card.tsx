import type { LucideIcon } from "lucide-react"
import { Panel } from "./panel"

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
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {trend && (
        <p className="mt-3 text-sm text-muted-foreground">
          {trend.isPositive ? "Up" : "Down"} {Math.abs(trend.value)}% on the previous period
        </p>
      )}
    </Panel>
  )
}

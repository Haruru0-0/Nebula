import type { LucideIcon } from "lucide-react"
import { GlassCard } from "./glass-card"

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
    <GlassCard hover={false} className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-teal-400" : "text-red-400"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="rounded-lg bg-teal-500/10 p-3">
          <Icon className="h-6 w-6 text-teal-400" />
        </div>
      </div>
    </GlassCard>
  )
}

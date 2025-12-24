"use client"

import { useState } from "react"
import { useLiveMetrics } from "@/hooks/use-live-metrics"
import { MetricCard } from "@/components/metric-card"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Activity, Zap, MessageSquare, AlertCircle, Pause, Play } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"1m" | "5m" | "15m">("5m")
  const { metrics, isPaused, togglePause } = useLiveMetrics(timeRange)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["1m", "5m", "15m"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-teal-500 hover:bg-teal-400" : ""}
            >
              {range}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={togglePause} className="gap-2 bg-transparent">
          {isPaused ? (
            <>
              <Play className="h-4 w-4" /> Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          )}
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tokens Processed"
          value={formatNumber(metrics.tokensProcessed)}
          icon={Zap}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Avg Latency"
          value={`${metrics.avgLatency.toFixed(0)}ms`}
          icon={Activity}
          trend={{ value: 5.2, isPositive: false }}
        />
        <MetricCard
          title="Messages"
          value={formatNumber(metrics.messageCount)}
          icon={MessageSquare}
          trend={{ value: 8.3, isPositive: true }}
        />
        <MetricCard
          title="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          icon={AlertCircle}
          trend={{ value: 1.2, isPositive: false }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latency Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.latencyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Tokens Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tokens Processed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.tokensHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Area type="monotone" dataKey="value" stroke="#14b8a6" fill="rgba(20,184,166,0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Messages Chart */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Messages Per Interval</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.messagesHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  )
}

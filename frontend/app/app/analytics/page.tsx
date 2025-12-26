"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { io, Socket } from "socket.io-client"
import secureLocalStorage from "react-secure-storage"
import api from "@/lib/store/api"
import { SERVER_ADDR } from "@/lib/store/constant"
import type { Metrics, ApiResponse, MetricsResponse } from "@/types"
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

const INITIAL_METRICS: Metrics = {
  tokensProcessed: 0,
  avgLatency: 0,
  messageCount: 0,
  errorRate: 0,
  latencyHistory: [],
  tokensHistory: [],
  messagesHistory: [],
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS)
  const [isPaused, setIsPaused] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Adjust max points based on range to keep charts readable but detailed enough
  const maxDataPoints = timeRange === "1h" ? 60 : timeRange === "24h" ? 100 : 200

  const fetchInitialMetrics = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<MetricsResponse>>(`/metrics/overall?period=${timeRange}`)
      const { summary, metrics: history } = response.data.data

      setMetrics({
        tokensProcessed: summary.totalTokensProcessed,
        avgLatency: summary.averageLatency,
        messageCount: summary.totalMessages,
        errorRate: 0,
        latencyHistory: history.map(m => ({ timestamp: new Date(m.timestamp), value: m.responseLatency })).slice(-maxDataPoints),
        tokensHistory: history.map(m => ({ timestamp: new Date(m.timestamp), value: m.tokensProcessed })).slice(-maxDataPoints),
        messagesHistory: history.map(m => ({ timestamp: new Date(m.timestamp), value: m.messageCount })).slice(-maxDataPoints),
      })
    } catch (error) {
      console.error("Failed to fetch initial metrics:", error)
    }
  }, [timeRange, maxDataPoints])

  useEffect(() => {
    fetchInitialMetrics()

    const interval = setInterval(() => {
      if (!isPaused) fetchInitialMetrics()
    }, 15000)

    return () => clearInterval(interval)
  }, [fetchInitialMetrics, isPaused])

  useEffect(() => {
    if (isPaused) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }

    const token = secureLocalStorage.getItem("accessToken")
    const socketUrl = SERVER_ADDR.replace("/api", "")

    const socket = io(`${socketUrl}/metrics`, {
      auth: { token },
    })

    socketRef.current = socket

    socket.on("metrics:update", (data: { metrics: any[], timestamp: string }) => {
      setMetrics((prev) => {
        const newest = data.metrics[data.metrics.length - 1]
        if (!newest) return prev

        const newLatencyPoint = { timestamp: new Date(data.timestamp), value: newest.responseLatency }
        const newTokensPoint = { timestamp: new Date(data.timestamp), value: newest.tokensProcessed }
        const newMessagesPoint = { timestamp: new Date(data.timestamp), value: newest.messageCount }

        const latencyHistory = [...prev.latencyHistory, newLatencyPoint].slice(-maxDataPoints)
        const tokensHistory = [...prev.tokensHistory, newTokensPoint].slice(-maxDataPoints)
        const messagesHistory = [...prev.messagesHistory, newMessagesPoint].slice(-maxDataPoints)

        return {
          ...prev,
          tokensProcessed: newest.totalTokensProcessed || (prev.tokensProcessed + newest.tokensProcessed),
          avgLatency: newest.averageLatency || newest.responseLatency,
          messageCount: newest.totalMessages || (prev.messageCount + newest.messageCount),
          latencyHistory,
          tokensHistory,
          messagesHistory,
        }
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [isPaused, maxDataPoints])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

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
          {(["1h", "24h", "7d", "30d"] as const).map((range) => (
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

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Socket } from "socket.io-client"
import { openMetricsSocket } from "@/lib/metrics-socket"
import api from "@/lib/store/api"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { fetchAgents, agentFetchSelector } from "@/lib/store/slices/agents/agentFetchSlice"
import type { Metrics, ApiResponse, MetricsResponse, Agent } from "@/types"
import { MetricCard } from "@/components/metric-card"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Zap, MessageSquare, AlertCircle, Pause, Play, Bot } from "lucide-react"
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
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector(agentFetchSelector)

  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS)
  const [isPaused, setIsPaused] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const previousAgentIdRef = useRef<string | null>(null)

  // Adjust max points based on range to keep charts readable but detailed enough
  const maxDataPoints = timeRange === "1h" ? 60 : timeRange === "24h" ? 100 : 200

  // Fetch agents on mount
  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  const fetchInitialMetrics = useCallback(async () => {
    try {
      const endpoint = selectedAgentId
        ? `/metrics/${selectedAgentId}?period=${timeRange}`
        : `/metrics/overall?period=${timeRange}`
      const response = await api.get<ApiResponse<MetricsResponse>>(endpoint)
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
  }, [timeRange, maxDataPoints, selectedAgentId])

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

    // The socket opens once the API has issued a handshake token; until then there is nothing to clean up
    let cancelled = false
    let opened: Socket | null = null
    openMetricsSocket()
      .then((s) => {
        if (cancelled) {
          s.disconnect()
          return
        }
        opened = s
        socketRef.current = s
        attach(s)
      })
      .catch(() => {})

    const attach = (socket: Socket) => {

    // Unsubscribe from previous subscription if agent changed
    if (previousAgentIdRef.current !== selectedAgentId) {
      if (previousAgentIdRef.current) {
        socket.emit('unsubscribe:agent', previousAgentIdRef.current)
      } else {
        socket.emit('unsubscribe:overall')
      }
    }

    // Subscribe to new subscription
    if (selectedAgentId) {
      socket.emit('subscribe:agent', selectedAgentId)
    } else {
      socket.emit('subscribe:overall')
    }
    previousAgentIdRef.current = selectedAgentId

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

    }

    return () => {
      cancelled = true
      opened?.disconnect()
    }
  }, [isPaused, maxDataPoints, selectedAgentId])

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            {(["1h", "24h", "7d", "30d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Agent Selector */}
          <Select
            value={selectedAgentId || "all"}
            onValueChange={(value) => setSelectedAgentId(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[200px] border-border bg-muted">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-foreground" />
                <SelectValue placeholder="All Agents" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="focus:bg-accent">
                <span className="font-medium">All Agents</span>
              </SelectItem>
              {agents.map((agent: Agent) => (
                <SelectItem key={agent.id} value={agent.id} className="focus:bg-accent">
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        />
        <MetricCard
          title="Avg Latency"
          value={`${metrics.avgLatency.toFixed(0)}ms`}
          icon={Activity}
        />
        <MetricCard
          title="Messages"
          value={formatNumber(metrics.messageCount)}
          icon={MessageSquare}
        />
        <MetricCard
          title="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          icon={AlertCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <Panel className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latency Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.latencyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e231a" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="#b9ab91"
                fontSize={12}
              />
              <YAxis stroke="#b9ab91" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1c150f",
                  border: "1px solid #2e231a",
                  borderRadius: "8px",
                }}
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Line type="monotone" dataKey="value" stroke="#f1d9a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        {/* Tokens Chart */}
        <Panel className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tokens Processed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.tokensHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e231a" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="#b9ab91"
                fontSize={12}
              />
              <YAxis stroke="#b9ab91" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1c150f",
                  border: "1px solid #2e231a",
                  borderRadius: "8px",
                }}
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Area type="monotone" dataKey="value" stroke="#f1d9a6" fill="rgba(241,217,166,0.14)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Messages Chart */}
        <Panel className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Messages Per Interval</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.messagesHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e231a" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="#b9ab91"
                fontSize={12}
              />
              <YAxis stroke="#b9ab91" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1c150f",
                  border: "1px solid #2e231a",
                  borderRadius: "8px",
                }}
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Bar dataKey="value" fill="#f1d9a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}

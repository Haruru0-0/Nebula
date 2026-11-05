"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Socket } from "socket.io-client"
import { openMetricsSocket } from "@/lib/metrics-socket"
import api from "@/lib/store/api"
import type { Metrics, ApiResponse, MetricsResponse } from "@/types"

const INITIAL_METRICS: Metrics = {
  tokensProcessed: 0,
  avgLatency: 0,
  messageCount: 0,
  errorRate: 0,
  latencyHistory: [],
  tokensHistory: [],
  messagesHistory: [],
}

export function useLiveMetrics(timeRange: "1m" | "5m" | "15m" = "5m") {
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS)
  const [isPaused, setIsPaused] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const maxDataPoints = timeRange === "1m" ? 30 : timeRange === "5m" ? 150 : 450

  const fetchInitialMetrics = useCallback(async () => {
    try {
      const periodMap = {
        "1m": "1h",
        "5m": "24h",
        "15m": "7d",
      }
      const response = await api.get<ApiResponse<MetricsResponse>>(`/metrics/overall?period=${periodMap[timeRange]}`)
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
  }, [isPaused, maxDataPoints])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  return {
    metrics,
    isPaused,
    togglePause,
  }
}

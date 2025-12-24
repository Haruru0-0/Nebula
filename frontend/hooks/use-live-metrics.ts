"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Metrics, MetricPoint } from "@/types"

const INITIAL_METRICS: Metrics = {
  tokensProcessed: 1250000,
  avgLatency: 145,
  messageCount: 8432,
  errorRate: 0.02,
  latencyHistory: [],
  tokensHistory: [],
  messagesHistory: [],
}

function generateDataPoint(baseValue: number, variance: number): number {
  return Math.max(0, baseValue + (Math.random() - 0.5) * variance)
}

export function useLiveMetrics(timeRange: "1m" | "5m" | "15m" = "5m") {
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const maxDataPoints = timeRange === "1m" ? 30 : timeRange === "5m" ? 150 : 450

  const updateMetrics = useCallback(() => {
    setMetrics((prev) => {
      const now = new Date()

      const newLatencyPoint: MetricPoint = {
        timestamp: now,
        value: generateDataPoint(prev.avgLatency, 40),
      }

      const newTokensPoint: MetricPoint = {
        timestamp: now,
        value: generateDataPoint(5000, 2000),
      }

      const newMessagesPoint: MetricPoint = {
        timestamp: now,
        value: generateDataPoint(10, 5),
      }

      const latencyHistory = [...prev.latencyHistory, newLatencyPoint].slice(-maxDataPoints)
      const tokensHistory = [...prev.tokensHistory, newTokensPoint].slice(-maxDataPoints)
      const messagesHistory = [...prev.messagesHistory, newMessagesPoint].slice(-maxDataPoints)

      return {
        ...prev,
        tokensProcessed: prev.tokensProcessed + newTokensPoint.value,
        avgLatency: newLatencyPoint.value,
        messageCount: prev.messageCount + Math.floor(newMessagesPoint.value),
        latencyHistory,
        tokensHistory,
        messagesHistory,
      }
    })
  }, [maxDataPoints])

  useEffect(() => {
    // Initialize with some data
    const initialHistory: MetricPoint[] = []
    const now = Date.now()
    for (let i = 30; i >= 0; i--) {
      initialHistory.push({
        timestamp: new Date(now - i * 2000),
        value: generateDataPoint(145, 40),
      })
    }

    const initialTokens: MetricPoint[] = []
    for (let i = 30; i >= 0; i--) {
      initialTokens.push({
        timestamp: new Date(now - i * 2000),
        value: generateDataPoint(5000, 2000),
      })
    }

    const initialMessages: MetricPoint[] = []
    for (let i = 30; i >= 0; i--) {
      initialMessages.push({
        timestamp: new Date(now - i * 2000),
        value: generateDataPoint(10, 5),
      })
    }

    setMetrics((prev) => ({
      ...prev,
      latencyHistory: initialHistory,
      tokensHistory: initialTokens,
      messagesHistory: initialMessages,
    }))
  }, [])

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(updateMetrics, 2000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, updateMetrics])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  return {
    metrics,
    isPaused,
    togglePause,
  }
}

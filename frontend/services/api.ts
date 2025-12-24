import type { Agent, ChatMessage, Metrics } from "@/types"

/**
 * Placeholder API functions - to be implemented with real backend
 * All functions throw "Not implemented" to make backend integration obvious
 */

export async function listAgents(): Promise<Agent[]> {
  throw new Error("Not implemented")
}

export async function createAgent(agent: Omit<Agent, "id" | "lastUpdated">): Promise<Agent> {
  throw new Error("Not implemented")
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
  throw new Error("Not implemented")
}

export async function deleteAgent(id: string): Promise<void> {
  throw new Error("Not implemented")
}

export async function sendMessage(agentId: string, message: string): Promise<ChatMessage> {
  throw new Error("Not implemented")
}

export async function connectMetricsStream(onMetrics: (metrics: Metrics) => void): Promise<() => void> {
  throw new Error("Not implemented")
}

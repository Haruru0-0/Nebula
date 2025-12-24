"use client"

import { useState, useCallback } from "react"
import type { Agent } from "@/types"

const INITIAL_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Content Writer",
    systemPrompt: "You are a helpful assistant specialized in creating engaging content.",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    tools: ["Web", "Files"],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
    isFavorite: true,
  },
  {
    id: "2",
    name: "Code Assistant",
    systemPrompt: "You are an expert programmer who helps with code reviews and debugging.",
    model: "gpt-4-turbo",
    temperature: 0.3,
    maxTokens: 4000,
    tools: ["Code", "Web", "Files"],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    name: "Data Analyst",
    systemPrompt: "You help analyze data and create visualizations.",
    model: "claude-3-opus",
    temperature: 0.5,
    maxTokens: 3000,
    tools: ["Vision", "Files"],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isFavorite: false,
  },
]

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(INITIAL_AGENTS[0]?.id || null)

  const createAgent = useCallback((agentData: Omit<Agent, "id" | "lastUpdated">) => {
    const newAgent: Agent = {
      ...agentData,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    }
    setAgents((prev) => [newAgent, ...prev])
    return newAgent
  }, [])

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, ...updates, lastUpdated: new Date() } : agent)),
    )
  }, [])

  const deleteAgent = useCallback(
    (id: string) => {
      setAgents((prev) => prev.filter((agent) => agent.id !== id))
      if (selectedAgentId === id) {
        setSelectedAgentId(null)
      }
    },
    [selectedAgentId],
  )

  const duplicateAgent = useCallback(
    (id: string) => {
      const agent = agents.find((a) => a.id === id)
      if (agent) {
        createAgent({
          ...agent,
          name: `${agent.name} (Copy)`,
        })
      }
    },
    [agents, createAgent],
  )

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null

  return {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    createAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
  }
}

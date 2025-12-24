"use client"

import { useState, useCallback } from "react"
import type { ChatMessage } from "@/types"

interface Conversation {
  id: string
  agentId: string
  messages: ChatMessage[]
  createdAt: Date
  lastUpdated: Date
}

export function useChat(agentId: string | null) {
  const [conversations, setConversations] = useState<Record<string, Conversation[]>>({})
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Get all conversations for current agent
  const agentConversations = agentId ? conversations[agentId] || [] : []

  // Get active conversation messages
  const activeConversation = activeConversationId
    ? agentConversations.find((c) => c.id === activeConversationId)
    : agentConversations[agentConversations.length - 1]

  const messages = activeConversation?.messages || []

  // Get or create conversation for agent
  const getOrCreateConversation = useCallback(
    (agentIdParam: string) => {
      const agentConvs = conversations[agentIdParam] || []
      let conversation = activeConversationId ? agentConvs.find((c) => c.id === activeConversationId) : null

      if (!conversation) {
        // Create new conversation
        conversation = {
          id: Date.now().toString(),
          agentId: agentIdParam,
          messages: [],
          createdAt: new Date(),
          lastUpdated: new Date(),
        }
        setConversations((prev) => ({
          ...prev,
          [agentIdParam]: [...(prev[agentIdParam] || []), conversation],
        }))
        setActiveConversationId(conversation.id)
      }

      return conversation
    },
    [activeConversationId, conversations],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!agentId) return

      const conversation = getOrCreateConversation(agentId)

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        agentId,
      }

      // Update conversation with user message
      setConversations((prev) => ({
        ...prev,
        [agentId]: prev[agentId].map((c) =>
          c.id === conversation.id ? { ...c, messages: [...c.messages, userMessage], lastUpdated: new Date() } : c,
        ),
      }))

      setIsTyping(true)

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "This is a placeholder response. In production, this would come from your AI backend.",
          timestamp: new Date(),
          agentId,
        }

        setConversations((prev) => ({
          ...prev,
          [agentId]: prev[agentId].map((c) =>
            c.id === conversation.id
              ? { ...c, messages: [...c.messages, assistantMessage], lastUpdated: new Date() }
              : c,
          ),
        }))
        setIsTyping(false)
      }, 1000)
    },
    [agentId, getOrCreateConversation],
  )

  const clearChat = useCallback(() => {
    if (agentId && activeConversation) {
      setConversations((prev) => ({
        ...prev,
        [agentId]: prev[agentId].filter((c) => c.id !== activeConversation.id),
      }))
      setActiveConversationId(null)
    }
  }, [agentId, activeConversation])

  const getConversations = useCallback(
    (agentIdParam: string) => {
      return conversations[agentIdParam] || []
    },
    [conversations],
  )

  const switchConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
  }, [])

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    getConversations,
    switchConversation,
    activeConversationId,
  }
}

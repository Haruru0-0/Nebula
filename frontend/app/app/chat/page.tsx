"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense } from "react"
import { useAgents } from "@/hooks/use-agents"
import { useChat } from "@/hooks/use-chat"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, ImageIcon, Sparkles, Plus, Trash2, MessageSquare, Paperclip, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AgentEditDialog } from "@/components/agent-edit-dialog"
import type { Agent } from "@/types"

function ChatPageContent() {
  const { agents, selectedAgentId, setSelectedAgentId, selectedAgent, updateAgent, createAgent } = useAgents()
  const { messages, isTyping, sendMessage, clearChat, getConversations, switchConversation, activeConversationId } =
    useChat(selectedAgentId)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [showAgentDialog, setShowAgentDialog] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const conversations = getConversations(selectedAgentId || "")

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (selectedAgentId) {
      const agentConvs = getConversations(selectedAgentId)
      if (agentConvs.length > 0) {
        switchConversation(agentConvs[agentConvs.length - 1].id)
      }
    }
  }, [selectedAgentId])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || !selectedAgentId) return
    sendMessage(input)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    switchConversation("")
  }

  const handleSaveAgent = (data: Partial<Agent>) => {
    if (editingAgent) {
      updateAgent(editingAgent.id, data)
    } else {
      const newAgent = createAgent(data as Omit<Agent, "id" | "createdAt">)
      setSelectedAgentId(newAgent.id)
    }
    setShowAgentDialog(false)
    setEditingAgent(null)
  }

  return (
    <div className="h-full flex gap-4 p-4 lg:p-6">
      <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col gap-4">

        {/* Conversations List */}
        {selectedAgentId && (
          <GlassCard className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Conversations</h3>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNewConversation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No conversations yet</p>
                    <p className="text-xs text-gray-500 mt-1">Start chatting to create one</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => switchConversation(conv.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all text-sm group relative",
                        "hover:bg-white/5",
                        activeConversationId === conv.id
                          ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30"
                          : "border border-transparent",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="truncate flex-1 font-medium">
                          {conv.messages[0]?.content.slice(0, 30) || "New conversation"}...
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 flex-shrink-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (activeConversationId === conv.id) {
                              clearChat()
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        {conv.messages.length} messages • {new Date(conv.lastUpdated).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </GlassCard>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden mb-4">
          <Select
            value={selectedAgentId || undefined}
            onValueChange={(value) => {
              if (value === "__new__") {
                setEditingAgent(null)
                setShowAgentDialog(true)
              } else {
                setSelectedAgentId(value)
              }
            }}
          >
            <SelectTrigger className="w-full bg-white/5 border-white/10 hover:bg-white/10 h-12">
              <SelectValue placeholder="Select an agent to chat..." />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/10">
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id} className="focus:bg-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="__new__" className="focus:bg-white/10 border-t border-white/10 mt-1">
                <div className="flex items-center gap-2 text-teal-400 font-semibold">
                  <Plus className="h-4 w-4" />
                  Create New Agent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              {selectedAgent ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{selectedAgent.name}</h2>
                    <p className="text-xs text-gray-400 truncate">{selectedAgent.model}</p>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">No agent selected</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
              className="flex-shrink-0"
            >
              Clear
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-500/20 mb-4">
                  <Sparkles className="h-10 w-10 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {selectedAgent
                    ? `Chat with ${selectedAgent.name} to get started. Each agent has its own conversation history.`
                    : "Select an agent to begin chatting."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-emerald-500/20 flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-teal-400" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[80%]",
                        message.role === "user" ? "bg-teal-500/90 text-white" : "bg-white/5 border border-white/10",
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                      <p className="text-xs opacity-60 mt-2">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-emerald-500/20">
                      <Sparkles className="h-4 w-4 text-teal-400" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedAgent ? "Ask a follow-up..." : "Select an agent first..."}
                disabled={!selectedAgent}
                className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px] max-h-[200px] px-4 pt-4 pb-2"
                rows={1}
              />

              {/* Controls bar */}
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                    disabled
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                    disabled
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                    disabled
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>

                  {/* Agent selector in input */}
                  <Select
                    value={selectedAgentId || undefined}
                    onValueChange={(value) => {
                      if (value === "__new__") {
                        setEditingAgent(null)
                        setShowAgentDialog(true)
                      } else {
                        setSelectedAgentId(value)
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 border-white/10 bg-white/5 hover:bg-white/10 w-[160px] sm:w-[180px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Wand2 className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                        <div className="truncate text-left">
                          <SelectValue placeholder="Select Agent" />
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-white/10">
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id} className="focus:bg-white/10">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                            <span className="truncate">{agent.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__" className="focus:bg-white/10 border-t border-white/10 mt-1">
                        <div className="flex items-center gap-2 text-teal-400 font-medium">
                          <Plus className="h-3.5 w-3.5" />
                          New Agent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedAgent}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <AgentEditDialog
        open={showAgentDialog}
        onOpenChange={setShowAgentDialog}
        agent={editingAgent}
        onSave={handleSaveAgent}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  )
}

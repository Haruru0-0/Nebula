"use client"

import { Markdown } from "@/components/markdown"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState, useRef, useEffect, Suspense, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { fetchAgents, agentFetchSelector } from "@/lib/store/slices/agents/agentFetchSlice"
import { fetchAgentById, agentDetailSelector, setCurrentAgent } from "@/lib/store/slices/agents/agentDetailSlice"
import { createAgent as createAgentAction, agentAddSelector, clearAgentAddState } from "@/lib/store/slices/agents/agentAddSlice"
import { updateAgent as updateAgentAction, agentUpdateSelector, clearAgentUpdateState } from "@/lib/store/slices/agents/agentUpdateSlice"
import { fetchConversations, conversationFetchSelector } from "@/lib/store/slices/chat/conversationFetchSlice"
import { fetchConversationById, conversationDetailSelector, setActiveConversation, addMessage } from "@/lib/store/slices/chat/conversationDetailSlice"
import { sendMessage as sendMessageAction, messageSendSelector, clearMessageSendState } from "@/lib/store/slices/chat/messageSendSlice"
import { deleteConversation, conversationDeleteSelector, clearConversationDeleteState } from "@/lib/store/slices/chat/conversationDeleteSlice"
import { updateConversation, conversationUpdateSelector, clearConversationUpdateState } from "@/lib/store/slices/chat/conversationUpdateSlice"
import { streamingChatSelector, startStreaming, appendToken, setConversationId, finishStreaming, setStreamingError, resetStreaming } from "@/lib/store/slices/chat/streamingChatSlice"
import { DIRECT_API_ADDR } from "@/lib/store/constant"
import api from "@/lib/store/api"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Send,
  ImageIcon,
  Bot,
  Plus,
  Trash2,
  MessageSquare,
  Paperclip,
  Wand2,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AgentEditDialog } from "@/components/agent-edit-dialog"
import { ConversationDeleteDialog } from "@/components/conversation-delete-dialog"
import { toast } from "sonner"
import type { Agent } from "@/types"


function ChatPageContent() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Selectors
  const { agents } = useAppSelector(agentFetchSelector)
  const { currentAgent: selectedAgent } = useAppSelector(agentDetailSelector)
  const { conversations, isFetching: isFetchingConvs } = useAppSelector(conversationFetchSelector)
  const { activeConversation, isFetching: isFetchingDetail } = useAppSelector(conversationDetailSelector)
  const { isSending, isSuccess: isSendSuccess, isError: isSendError, errorMessage: sendError } = useAppSelector(messageSendSelector)
  const { isDeleting, isSuccess: isDeleteSuccess } = useAppSelector(conversationDeleteSelector)
  const { isUpdating: isRenaming, isSuccess: isRenameSuccess } = useAppSelector(conversationUpdateSelector)
  const { isSuccess: isAgentAddSuccess } = useAppSelector(agentAddSelector)
  const { isSuccess: isAgentUpdateSuccess } = useAppSelector(agentUpdateSelector)
  const { isStreaming, streamingContent, streamingConversationId } = useAppSelector(streamingChatSelector)

  const [selectedAgentId, setLocalSelectedAgentId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasSelectedInitial = useRef(false)

  const [showAgentDialog, setShowAgentDialog] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [conversationTitleToDelete, setConversationTitleToDelete] = useState<string>("")

  // Rename state
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const messages = activeConversation?.messages || []
  const currentConversations = useMemo(() =>
    conversations.filter(c => c.agentId === selectedAgentId),
    [conversations, selectedAgentId]
  )

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  // Auto-select last agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      const lastAgent = agents[agents.length - 1]
      setLocalSelectedAgentId(lastAgent.id)
      dispatch(fetchAgentById(lastAgent.id))
      dispatch(fetchConversations(lastAgent.id))
    }
  }, [agents, selectedAgentId, dispatch])

  // Scroll to bottom on messages change or streaming content change
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isStreaming, streamingContent, activeConversation])

  // Auto-select first conversation when agent changes
  useEffect(() => {
    if (selectedAgentId && !isFetchingConvs) {
      dispatch(fetchConversations(selectedAgentId))
    }
  }, [selectedAgentId, dispatch]) // Only fetch when agent ID changes

  // Auto-select last conversation when conversations are loaded, but only once per agent selection
  useEffect(() => {
    if (selectedAgentId) {
      // Reset selection flag when agent changes
      hasSelectedInitial.current = false
    }
  }, [selectedAgentId])

  useEffect(() => {
    if (currentConversations.length > 0 && !activeConversation && !isFetchingDetail && !hasSelectedInitial.current) {
      // Only auto-select if we haven't manually selected or created a new one yet
      // and only if we are in an "initial load" state (not just clicked 'new chat')
      dispatch(fetchConversationById(currentConversations[currentConversations.length - 1].id))
      hasSelectedInitial.current = true
    }
  }, [currentConversations, activeConversation, isFetchingDetail, dispatch])

  // Operation Handlers
  useEffect(() => {
    if (isSendSuccess) {
      if (selectedAgentId) dispatch(fetchConversations(selectedAgentId))
      if (activeConversation) dispatch(fetchConversationById(activeConversation.id))
      dispatch(clearMessageSendState())
    }
    if (isSendError) {
      toast.error(sendError || "Failed to send message")
      dispatch(clearMessageSendState())
    }
  }, [isSendSuccess, isSendError, sendError, dispatch, selectedAgentId, activeConversation])

  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success("Conversation deleted")
      if (selectedAgentId) dispatch(fetchConversations(selectedAgentId))
      dispatch(setActiveConversation(null))
      dispatch(clearConversationDeleteState())
      setDeleteConfirmOpen(false)
      setConversationToDelete(null)
      setConversationTitleToDelete("")
    }
  }, [isDeleteSuccess, dispatch, selectedAgentId])

  useEffect(() => {
    if (isRenameSuccess) {
      toast.success("Conversation renamed")
      if (selectedAgentId) dispatch(fetchConversations(selectedAgentId))
      dispatch(clearConversationUpdateState())
      setEditingConversationId(null)
      setEditingTitle("")
    }
  }, [isRenameSuccess, dispatch, selectedAgentId])

  useEffect(() => {
    if (isAgentAddSuccess) {
      dispatch(fetchAgents())
      dispatch(clearAgentAddState())
    }
  }, [isAgentAddSuccess, dispatch])

  useEffect(() => {
    if (isAgentUpdateSuccess) {
      dispatch(fetchAgents())
      dispatch(clearAgentUpdateState())
    }
  }, [isAgentUpdateSuccess, dispatch])

  // Textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSelectAgent = (id: string | null) => {
    setLocalSelectedAgentId(id)
    dispatch(setActiveConversation(null))
    if (id) {
      dispatch(fetchAgentById(id))
      dispatch(fetchConversations(id))
    } else {
      dispatch(setCurrentAgent(null))
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId) return

    const messageToSend = input
    setInput("")

    // Optimistic update: show user message immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: messageToSend,
      createdAt: new Date().toISOString(),
      conversationId: activeConversation?.id || ""
    }
    dispatch(addMessage(tempUserMessage))

    // Start streaming state
    dispatch(startStreaming(activeConversation?.id || null))

    try {
      // The reply streams straight from the backend (a proxy may cut long streams), so it cannot use the cookie.
      // The API hands out a one-minute token for the request instead.
      const ticket = (await api.get<{ data: { token: string } }>("/auth/socket-token")).data.data.token
      const response = await fetch(`${DIRECT_API_ADDR}/chat/${selectedAgentId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ticket}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationId: activeConversation?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start streaming')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'start') {
                dispatch(setConversationId(data.conversationId))
              } else if (data.type === 'token') {
                dispatch(appendToken(data.content))
              } else if (data.type === 'done') {
                dispatch(finishStreaming(data.message))
                // Refresh conversation list and detail
                if (selectedAgentId) dispatch(fetchConversations(selectedAgentId))
                dispatch(fetchConversationById(data.conversationId))
              } else if (data.type === 'error') {
                dispatch(setStreamingError(data.message))
                if (typeof data.message === 'string' && data.message.includes('API key')) {
                  toast.error(data.message, { action: { label: 'Open Profile', onClick: () => router.push('/app/profile') } })
                } else {
                  toast.error(data.message)
                }
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      dispatch(setStreamingError(error instanceof Error ? error.message : 'Streaming failed'))
      toast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    dispatch(setActiveConversation(null))
  }

  const handleSaveAgent = (data: Partial<Agent>) => {
    if (editingAgent) {
      dispatch(updateAgentAction({ id: editingAgent.id, data }))
    } else {
      dispatch(createAgentAction(data))
    }
    setShowAgentDialog(false)
    setEditingAgent(null)
  }

  const handleDeleteConversation = (conv: { id: string; title: string }) => {
    setConversationToDelete(conv.id)
    setConversationTitleToDelete(conv.title)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteConversation = () => {
    if (conversationToDelete) {
      dispatch(deleteConversation(conversationToDelete))
    }
  }

  const handleStartRename = (conv: { id: string; title: string }) => {
    setEditingConversationId(conv.id)
    setEditingTitle(conv.title)
  }

  const handleSaveRename = () => {
    if (editingConversationId && editingTitle.trim()) {
      dispatch(updateConversation({ conversationId: editingConversationId, title: editingTitle.trim() }))
    }
  }

  const handleCancelRename = () => {
    setEditingConversationId(null)
    setEditingTitle("")
  }

  const ConversationsSidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col gap-4 h-full", mobile ? "w-full" : "w-full")}>
      <div className="flex flex-col gap-4 flex-1">
        {/* Conversations List */}
        <Panel className="flex-1 flex flex-col overflow-hidden">

          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">History</h3>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {!selectedAgentId ? (
                <div className="text-center py-8 px-4">
                  <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Select an agent</p>
                  <p className="text-xs text-muted-foreground mt-1">to see chat history</p>
                </div>
              ) : currentConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start chatting to create one</p>
                </div>
              ) : (
                currentConversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id
                  const isEditing = editingConversationId === conv.id

                  return (
                    <div
                      key={conv.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => !isEditing && dispatch(fetchConversationById(conv.id))}
                      onKeyDown={(e) => {
                        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          dispatch(fetchConversationById(conv.id))
                        }
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all text-sm group relative cursor-pointer",
                        isSelected
                          ? "bg-secondary border border-border"
                          : "border border-transparent hover:bg-accent",
                      )}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-7 text-sm bg-accent border-border"
                            autoFocus
                            onKeyDown={(e) => {
                              e.stopPropagation()
                              if (e.key === 'Enter') handleSaveRename()
                              if (e.key === 'Escape') handleCancelRename()
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveRename()
                            }}
                            disabled={isRenaming}
                          >
                            {isRenaming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-foreground" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelRename()
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="truncate flex-1 font-medium">
                              {conv.title || conv.messages?.[0]?.content.slice(0, 30) || "New conversation"}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartRename({ id: conv.id, title: conv.title || conv.messages?.[0]?.content.slice(0, 30) || "New conversation" })
                                }}
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteConversation({ id: conv.id, title: conv.title || conv.messages?.[0]?.content.slice(0, 30) || "New conversation" })
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {conv.messages?.length || 0} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </Panel>
      </div>
    </div>
  )

  return (
    <div className="h-full flex gap-4 p-4 lg:p-6 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col gap-4">
        <ConversationsSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Panel className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Sidebar Trigger */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-popover border-border p-6 pt-12" title="Conversations" description="Chat conversations sidebar">
                    <ConversationsSidebar mobile />
                  </SheetContent>
                </Sheet>
              </div>

              {selectedAgent ? (
                <>
                  <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                    <Bot className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{selectedAgent.name}</h2>
                    <p className="text-xs text-muted-foreground truncate">{selectedAgent.model}</p>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">No agent selected</span>
              )}
            </div>
          </div>


          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0 px-4 py-2" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
                  <Bot className="h-10 w-10 text-foreground" />
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
                    className={cn("flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                        <Bot className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-md px-4 py-3 max-w-[85%] sm:max-w-[80%]",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Markdown>{message.content}</Markdown>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                      <p className="text-xs opacity-60 mt-2">{new Date(message.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <Bot className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="rounded-md px-4 py-3 bg-muted border border-border max-w-[85%] sm:max-w-[80%]">
                      {streamingContent ? (
                        <div>
                          <Markdown>{streamingContent}</Markdown>
                          <span className="inline-block w-1.5 h-4 bg-primary mt-1 motion-safe:animate-pulse" aria-hidden />
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full motion-safe:animate-pulse" />
                          <div className="w-2 h-2 bg-primary rounded-full motion-safe:animate-pulse [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-primary rounded-full motion-safe:animate-pulse [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border bg-card">
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedAgent ? "Ask a follow-up..." : "Select an agent first..."}
                disabled={!selectedAgent || isStreaming}
                className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px] max-h-[200px] px-4 pt-4 pb-2"
                rows={1}
              />

              {/* Controls bar */}
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    disabled
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    disabled
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
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
                        handleSelectAgent(value)
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 border-border bg-muted hover:bg-accent w-[160px] sm:w-[180px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Wand2 className="h-3.5 w-3.5 text-foreground flex-shrink-0" />
                        <div className="truncate text-left">
                          <SelectValue placeholder="Select Agent" />
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {agents.map((agent: Agent) => (
                        <SelectItem key={agent.id} value={agent.id} className="focus:bg-accent">
                          <div className="flex items-center gap-2">
                            <Bot className="h-3.5 w-3.5 text-foreground" />
                            <span className="truncate">{agent.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__" className="focus:bg-accent border-t border-border mt-1">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Plus className="h-3.5 w-3.5" />
                          New Agent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedAgent || isStreaming}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
                >
                  {isStreaming ? <Loader2 className="h-4 w-4 animate-spin text-foreground" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

        </Panel>
      </div>

      <AgentEditDialog
        open={showAgentDialog}
        onOpenChange={setShowAgentDialog}
        agent={editingAgent}
        onSave={handleSaveAgent}
      />

      <ConversationDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        conversationTitle={conversationTitleToDelete}
        onConfirm={confirmDeleteConversation}
        isLoading={isDeleting}
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

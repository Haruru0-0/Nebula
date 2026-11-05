"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { fetchAgents, agentFetchSelector } from "@/lib/store/slices/agents/agentFetchSlice"
import { deleteAgent, agentDeleteSelector, clearAgentDeleteState } from "@/lib/store/slices/agents/agentDeleteSlice"
import { createAgent as createAgentAction, agentAddSelector, clearAgentAddState } from "@/lib/store/slices/agents/agentAddSlice"
import { updateAgent as updateAgentAction, agentUpdateSelector, clearAgentUpdateState } from "@/lib/store/slices/agents/agentUpdateSlice"
import { fetchAgentById, agentDetailSelector, setCurrentAgent } from "@/lib/store/slices/agents/agentDetailSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Search, Plus, Edit2, Copy, Trash2, Star, Loader2, KeyRound, Bot } from "lucide-react"
import { useApiKeys, providerName } from "@/hooks/use-api-keys"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentEditDialog } from "@/components/agent-edit-dialog"
import { AgentDeleteDialog } from "@/components/agent-delete-dialog"
import type { Agent } from "@/types"

function AgentsContent() {
  const dispatch = useAppDispatch()
  const { isMissing } = useApiKeys()

  // Selectors
  const reduceMotion = useReducedMotion()
  const { agents, isFetching: isFetchingAgents } = useAppSelector(agentFetchSelector)
  const { currentAgent: selectedAgent, isFetching: isFetchingDetail } = useAppSelector(agentDetailSelector)
  const { isDeleting, isSuccess: isDeleteSuccess, isError: isDeleteError, errorMessage: deleteError } = useAppSelector(agentDeleteSelector)
  const { isAdding, isSuccess: isAddSuccess, isError: isAddError, errorMessage: addError } = useAppSelector(agentAddSelector)
  const { isUpdating, isSuccess: isUpdateSuccess, isError: isUpdateError, errorMessage: updateError } = useAppSelector(agentUpdateSelector)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgentId, setLocalSelectedAgentId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  const isLoading = isFetchingAgents || isDeleting || isAdding || isUpdating || isFetchingDetail

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  // Operation Handlers (Toasts & Refresh)
  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success("Agent deleted successfully")
      dispatch(clearAgentDeleteState())
      dispatch(fetchAgents())
    }
    if (isDeleteError) {
      toast.error(deleteError || "Failed to delete agent")
      dispatch(clearAgentDeleteState())
    }
  }, [isDeleteSuccess, isDeleteError, deleteError, dispatch])

  useEffect(() => {
    if (isAddSuccess) {
      toast.success("Agent created successfully")
      dispatch(clearAgentAddState())
      dispatch(fetchAgents())
    }
    if (isAddError) {
      toast.error(addError || "Failed to create agent")
      dispatch(clearAgentAddState())
    }
  }, [isAddSuccess, isAddError, addError, dispatch])

  useEffect(() => {
    if (isUpdateSuccess) {
      toast.success("Agent updated successfully")
      dispatch(clearAgentUpdateState())
      dispatch(fetchAgents())
    }
    if (isUpdateError) {
      toast.error(updateError || "Failed to update agent")
      dispatch(clearAgentUpdateState())
    }
  }, [isUpdateSuccess, isUpdateError, updateError, dispatch])

  const filteredAgents = agents.filter((agent) => agent.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelectAgent = (id: string | null) => {
    setLocalSelectedAgentId(id)
    if (id) {
      dispatch(fetchAgentById(id))
    } else {
      dispatch(setCurrentAgent(null))
    }
  }

  const handleEdit = (agent: Agent) => {
    setAgentToEdit(agent)
    handleSelectAgent(agent.id)
    setEditDialogOpen(true)
  }

  const handleNewAgent = () => {
    setAgentToEdit(null)
    handleSelectAgent(null)
    setEditDialogOpen(true)
  }

  const handleSave = (formData: Partial<Agent>) => {
    if (agentToEdit) {
      // Filter out fields that backend doesn't allow for updates
      const { id, userId, createdAt, updatedAt, _count, isFavorite, ...updateData } = formData as any
      const allowedFields = ["name", "systemPrompt", "provider", "model", "temperature", "maxTokens", "isActive"]

      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updateData[key]
          return obj
        }, {})

      dispatch(updateAgentAction({ id: agentToEdit.id, data: filteredData }))
    } else {
      dispatch(createAgentAction(formData))
    }
  }

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (agentToDelete) {
      dispatch(deleteAgent(agentToDelete.id))
      // Close right away; the toast reports the result. The agent stays set so the name does not vanish mid-fade.
      setDeleteDialogOpen(false)
    }
  }

  const handleDuplicate = (agent: Agent) => {
    const { id: _, userId, createdAt, updatedAt, _count, ...agentData } = agent
    dispatch(createAgentAction({
      ...agentData,
      name: `${agent.name} (Copy)`,
    }))
  }

  return (
    <>
      <div className="h-full flex flex-col gap-6 p-6">
        {agents.some((a) => isMissing(a.provider)) && (
          <Panel className="flex flex-wrap items-center justify-between gap-3 border-marker/50 p-4">
            <p className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4 shrink-0 text-error-text" aria-hidden />
              Some of your agents have no API key yet, so they cannot answer in chat.
            </p>
            <Button asChild size="sm">
              <Link href="/app/profile">Add an API key</Link>
            </Button>
          </Panel>
        )}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border"
            />
          </div>
          <Button onClick={handleNewAgent} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {filteredAgents.length === 0 && !isFetchingAgents && (
            <div className="mx-2 mt-2 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <Bot className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden />
              {agents.length === 0 ? (
                <>
                  <h2 className="text-lg font-semibold">No agents yet</h2>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    An agent is a model with a role. Give it a name and a prompt, pick a provider, and it shows up here, ready to chat.
                  </p>
                  <Button onClick={handleNewAgent} className="mt-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first agent
                  </Button>
                  <p className="mt-4 max-w-sm text-xs text-muted-foreground">
                    You will need an API key from OpenAI, Gemini or DeepSeek to chat. Add one in{" "}
                    <Link href="/app/profile" className="underline underline-offset-2 hover:text-foreground">
                      Profile
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">No agents match "{searchQuery}"</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Try a different name, or clear the search.</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-5">
                    Clear search
                  </Button>
                </>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.055, ease: [0.22, 1, 0.36, 1] }}
              >
              <Panel
                className={`p-4 cursor-pointer transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 ${selectedAgent?.id === agent.id ? "ring-2 ring-ring" : ""
                  }`}
                onClick={() => handleSelectAgent(agent.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{agent.name}</h3>
                      {agent.isFavorite && <Star className="h-3 w-3 fill-marker text-marker flex-shrink-0" />}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1 h-4 uppercase font-bold bg-accent">
                        {agent.provider || "openai"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1 h-4">
                        {agent.model}
                      </Badge>
                    </div>
                  </div>
                </div>
                {isMissing(agent.provider) && (
                  <Link
                    href="/app/profile"
                    onClick={(e) => e.stopPropagation()}
                    className="mb-2 inline-flex items-center gap-1 text-xs text-error-text underline-offset-4 hover:underline"
                  >
                    <KeyRound className="h-3 w-3" aria-hidden />
                    No {providerName(agent.provider || "openai")} key yet. Add one
                  </Link>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  Updated {new Date(agent.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(agent)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicate(agent)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(agent)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Panel>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Only block the page on the first load. Opening Edit fetches the agent's details; covering the page for that looked like a black flash. */}
        {isFetchingAgents && agents.length === 0 && (
          <div className="absolute inset-0 bg-card flex items-center justify-center z-50 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
        )}
      </div>

      <AgentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        agent={agentToEdit}
        onSave={handleSave}
        isLoading={isLoading}
      />

      <AgentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        agent={agentToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </>
  )
}

export default function AgentsPage() {
  return (
    <Suspense fallback={null}>
      <AgentsContent />
    </Suspense>
  )
}

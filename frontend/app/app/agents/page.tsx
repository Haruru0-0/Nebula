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
import { GlassCard } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit2, Copy, Trash2, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentEditDialog } from "@/components/agent-edit-dialog"
import { AgentDeleteDialog } from "@/components/agent-delete-dialog"
import type { Agent } from "@/types"

function AgentsContent() {
  const dispatch = useAppDispatch()

  // Selectors
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
      setAgentToDelete(null)
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
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
          <Button onClick={handleNewAgent} className="bg-teal-500 hover:bg-teal-400">
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
            {filteredAgents.map((agent) => (
              <GlassCard
                key={agent.id}
                className={`p-4 cursor-pointer transition-all ${selectedAgent?.id === agent.id ? "ring-2 ring-teal-500" : ""
                  }`}
                onClick={() => handleSelectAgent(agent.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{agent.name}</h3>
                      {agent.isFavorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1 h-4 uppercase font-bold bg-white/10">
                        {agent.provider || "openai"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1 h-4">
                        {agent.model}
                      </Badge>
                    </div>
                  </div>
                </div>
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
                    className="h-8 w-8 text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(agent)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </ScrollArea>

        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
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

"use client"

import { Suspense, useState } from "react"
import { useAgents } from "@/hooks/use-agents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit2, Copy, Trash2, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentEditDialog } from "@/components/agent-edit-dialog"
import { AgentDeleteDialog } from "@/components/agent-delete-dialog"
import type { Agent } from "@/types"

function AgentsContent() {
  const { agents, selectedAgent, setSelectedAgentId, createAgent, updateAgent, deleteAgent, duplicateAgent } =
    useAgents()
  const [searchQuery, setSearchQuery] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const { toast } = useToast()

  const filteredAgents = agents.filter((agent) => agent.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleEdit = (agent: Agent) => {
    setAgentToEdit(agent)
    setSelectedAgentId(agent.id)
    setEditDialogOpen(true)
  }

  const handleNewAgent = () => {
    setAgentToEdit(null)
    setSelectedAgentId(null)
    setEditDialogOpen(true)
  }

  const handleSave = (formData: Partial<Agent>) => {
    if (agentToEdit) {
      updateAgent(agentToEdit.id, formData)
      toast({
        title: "Agent Updated",
        description: `${formData.name} has been updated successfully.`,
      })
    } else {
      createAgent(formData as Omit<Agent, "id" | "lastUpdated">)
      toast({
        title: "Agent Created",
        description: `${formData.name} has been created successfully.`,
      })
    }
  }

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (agentToDelete) {
      deleteAgent(agentToDelete.id)
      toast({
        title: "Agent Deleted",
        description: `${agentToDelete.name} has been deleted.`,
      })
      setAgentToDelete(null)
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <GlassCard
                key={agent.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedAgent?.id === agent.id ? "ring-2 ring-teal-500" : ""
                }`}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{agent.name}</h3>
                      {agent.isFavorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {agent.model}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Updated {new Date(agent.lastUpdated).toLocaleDateString()}
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
                      duplicateAgent(agent.id)
                      toast({ title: "Agent Duplicated" })
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
      </div>

      <AgentEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} agent={agentToEdit} onSave={handleSave} />

      <AgentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        agent={agentToDelete}
        onConfirm={handleDeleteConfirm}
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

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Agent } from "@/types"

interface AgentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: (data: Partial<Agent>) => void
}

function AgentEditForm({
  agent,
  onSave,
  onClose,
}: { agent: Agent | null; onSave: (data: Partial<Agent>) => void; onClose: () => void }) {
  const [formData, setFormData] = useState<Partial<Agent>>(
    agent || {
      name: "",
      systemPrompt: "",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      tools: [],
    },
  )

  useEffect(() => {
    if (agent) {
      setFormData(agent)
    }
  }, [agent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Content Writer"
          className="bg-white/5 border-white/10"
          required
        />
      </div>

      <div>
        <Label htmlFor="prompt">System Prompt</Label>
        <Textarea
          id="prompt"
          value={formData.systemPrompt || ""}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          placeholder="Define how your agent should behave..."
          rows={6}
          className="bg-white/5 border-white/10 resize-none"
          required
        />
      </div>

      <div>
        <Label htmlFor="model">Model</Label>
        <Select value={formData.model || "gpt-4"} onValueChange={(value) => setFormData({ ...formData, model: value })}>
          <SelectTrigger id="model" className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-white/10">
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="temperature">Temperature: {formData.temperature?.toFixed(1) || "0.7"}</Label>
        <Slider
          id="temperature"
          value={[formData.temperature || 0.7]}
          onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
          min={0}
          max={1}
          step={0.1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          value={formData.maxTokens || 2000}
          onChange={(e) => setFormData({ ...formData, maxTokens: Number.parseInt(e.target.value) })}
          className="bg-white/5 border-white/10"
        />
      </div>

      <div>
        <Label>Tools</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {["Web", "Files", "Code", "Vision"].map((tool) => (
            <Badge
              key={tool}
              variant={formData.tools?.includes(tool) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                const tools = formData.tools || []
                setFormData({
                  ...formData,
                  tools: tools.includes(tool) ? tools.filter((t) => t !== tool) : [...tools, tool],
                })
              }}
            >
              {tool}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-400">
          {agent ? "Save Changes" : "Create Agent"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function AgentEditDialog({ open, onOpenChange, agent, onSave }: AgentEditDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black/95 border-white/10 max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{agent ? "Edit Agent" : "Create New Agent"}</DialogTitle>
            <DialogDescription>Configure your AI agent settings and behavior</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <AgentEditForm agent={agent} onSave={onSave} onClose={() => onOpenChange(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black/95 border-white/10">
        <DrawerHeader>
          <DrawerTitle>{agent ? "Edit Agent" : "Create New Agent"}</DrawerTitle>
          <DrawerDescription>Configure your AI agent settings and behavior</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="max-h-[80vh] px-4 pb-4">
          <AgentEditForm agent={agent} onSave={onSave} onClose={() => onOpenChange(false)} />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

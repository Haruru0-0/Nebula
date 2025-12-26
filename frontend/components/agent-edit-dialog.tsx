"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent } from "@/types"

interface AgentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: (data: Partial<Agent>) => void
  isLoading?: boolean
}

function AgentEditForm({
  agent,
  onSave,
  onClose,
  isLoading,
}: { agent: Agent | null; onSave: (data: Partial<Agent>) => void; onClose: () => void; isLoading?: boolean }) {
  const [formData, setFormData] = useState<Partial<Agent>>(() => {
    if (agent) {
      return {
        ...agent,
        provider: agent.provider || "openai",
      }
    }
    return {
      name: "",
      systemPrompt: "",
      provider: "openai",
      model: "gpt-5.2",
      temperature: 0.7,
      maxTokens: 2000,
      tools: [],
    }
  })

  const modelsByProvider = {
    openai: [
      { id: "gpt-5.2", name: "GPT-5.2" },
      { id: "gpt-5-mini", name: "GPT-5 Mini" },
      { id: "gpt-5-nano", name: "GPT-5 Nano" },
      { id: "gpt-5.2-pro", name: "GPT-5.2 Pro" },
      { id: "gpt-5", name: "GPT-5" },
      { id: "gpt-4.1", name: "GPT-4.1" },
    ],
    gemini: [
      { id: "gemini-3.0-pro", name: "Gemini 3.0 Pro" },
      { id: "gemini-3.0-flash", name: "Gemini 3.0 Flash" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    ],
  }

  useEffect(() => {
    const availableModels = modelsByProvider[formData.provider as keyof typeof modelsByProvider]
    if (availableModels && availableModels.length > 0) {
      const currentModel = availableModels.find(model => model.id === formData.model)
      if (!currentModel) {
        // If current model is not available for this provider, use the first model
        setFormData((prev) => ({
          ...prev,
          model: availableModels[0].id,
        }))
      }
    }
  }, [formData.provider, formData.model])

  const handleProviderChange = (provider: "openai" | "gemini") => {
    setFormData({
      ...formData,
      provider,
      model: modelsByProvider[provider][0].id,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <form id="agent-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-zinc-400 mb-1.5 block">
            Agent Name
          </Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Content Writer"
            className="bg-white/5 border-white/10 h-11 focus:ring-teal-500/20"
            required
          />
        </div>
        <div>
          <Label htmlFor="provider" className="text-zinc-400 mb-1.5 block">
            AI Provider
          </Label>
          <Select
            value={formData.provider || "openai"}
            onValueChange={(value: "openai" | "gemini") => handleProviderChange(value)}
          >
            <SelectTrigger id="provider" className="bg-white/5 border-white/10 h-11">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/10">
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="prompt" className="text-zinc-400 mb-1.5 block">
          System Prompt
        </Label>
        <Textarea
          id="prompt"
          value={formData.systemPrompt || ""}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          placeholder="Define how your agent should behave..."
          rows={8}
          className="bg-white/5 border-white/10 resize-none focus:ring-teal-500/20"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="model" className="text-zinc-400 mb-1.5 block">
            Model
          </Label>
          <Select
            key={`model-${formData.provider}`}
            value={formData.model}
            onValueChange={(value) => setFormData({ ...formData, model: value })}
          >
            <SelectTrigger id="model" className="bg-white/5 border-white/10 h-11">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/10 border-teal-500/20">
              {(modelsByProvider[formData.provider as keyof typeof modelsByProvider] || modelsByProvider.openai).map(
                (model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="maxTokens" className="text-zinc-400 mb-1.5 block">
            Max Tokens
          </Label>
          <Input
            id="maxTokens"
            type="number"
            value={formData.maxTokens || 2000}
            onChange={(e) => setFormData({ ...formData, maxTokens: Number.parseInt(e.target.value) })}
            className="bg-white/5 border-white/10 h-11 focus:ring-teal-500/20"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="temperature" className="text-zinc-400 mb-1.5 block">
          Temperature: {formData.temperature?.toFixed(1) || "0.7"}
        </Label>
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
        <Label className="text-zinc-400 mb-1.5 block">Capabilities</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {["Web", "Files", "Code", "Vision"].map((tool) => (
            <Badge
              key={tool}
              variant={formData.tools?.includes(tool) ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-4 py-2 text-sm transition-all duration-200",
                formData.tools?.includes(tool)
                  ? "bg-teal-500 text-black hover:bg-teal-400 shadow-lg shadow-teal-500/20"
                  : "hover:bg-white/10 border-white/10 text-zinc-400",
              )}
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
    </form>
  )
}

export function AgentEditDialog({ open, onOpenChange, agent, onSave, isLoading }: AgentEditDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-2xl h-[90vh] !flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 pb-4 flex-shrink-0 border-b border-white/5">
            <DialogTitle className="text-3xl font-bold tracking-tight">
              {agent ? "Edit Agent" : "Create New Agent"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-lg">
              Define your agent's identity, behavior, and specialized tools.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 px-8">
            <AgentEditForm
              key={agent?.id || "new"}
              agent={agent}
              onSave={onSave}
              onClose={() => onOpenChange(false)}
              isLoading={isLoading}
            />
          </ScrollArea>

          <DialogFooter className="p-8 pt-4 border-t border-white/10 flex-shrink-0 bg-black/40">
            <Button
              type="submit"
              form="agent-form"
              size="lg"
              className="px-8 bg-teal-500 hover:bg-teal-400 text-black font-bold h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : agent ? (
                "Save Changes"
              ) : (
                "Create Agent"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-8 text-zinc-400 hover:text-white h-12"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-zinc-950 border-white/10 h-[96dvh] max-h-[96dvh] flex flex-col p-0 rounded-t-[32px] overflow-hidden">
        <div className="mx-auto w-12 h-1.5 bg-zinc-800 rounded-full mt-3 mb-1 shrink-0" />
        <DrawerHeader className="p-6 pb-2 flex-shrink-0 text-left">
          <DrawerTitle className="text-2xl font-bold">{agent ? "Edit Agent" : "New Agent"}</DrawerTitle>
          <DrawerDescription className="text-zinc-400">Configure your AI assistant.</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          <AgentEditForm
            key={agent?.id || "new"}
            agent={agent}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>

        <DrawerFooter className="p-6 pt-4 pb-12 border-t border-white/10 flex-shrink-0 flex flex-row gap-3 bg-black/60 backdrop-blur-md">
          <Button
            type="submit"
            form="agent-form"
            className="flex-1 h-14 bg-teal-500 hover:bg-teal-400 text-black font-bold text-lg rounded-2xl shadow-lg shadow-teal-500/10"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : agent ? (
              "Save"
            ) : (
              "Create"
            )}
          </Button>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-14 border-white/10 text-zinc-300 font-semibold text-lg rounded-2xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


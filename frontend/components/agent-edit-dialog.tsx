"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Agent } from "@/types"

interface AgentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: (data: Partial<Agent>) => void
  isLoading?: boolean
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Agent name is required.",
  }),
  systemPrompt: z.string().min(1, {
    message: "System prompt is required.",
  }),
  provider: z.enum(["openai", "gemini"], {
    required_error: "Please select a provider.",
  }),
  model: z.string().min(1, {
    message: "Please select a model.",
  }),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(10000),
  tools: z.array(z.string()),
})

function AgentEditForm({
  agent,
  onSave,
  onClose,
  isLoading,
}: { agent: Agent | null; onSave: (data: Partial<Agent>) => void; onClose: () => void; isLoading?: boolean }) {
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([])

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agent?.name || "",
      systemPrompt: agent?.systemPrompt || "",
      provider: (agent?.provider as "openai" | "gemini") || "openai",
      model: agent?.model || "gpt-5.2",
      temperature: agent?.temperature || 0.7,
      maxTokens: agent?.maxTokens || 2000,
      tools: agent?.tools || [],
    },
  })

  // Update available models when provider changes
  const watchedProvider = form.watch("provider")
  useEffect(() => {
    const models = modelsByProvider[watchedProvider] || modelsByProvider.openai
    setAvailableModels(models)
    
    // If current model is not available in the new provider, reset to first model
    const currentModel = form.getValues("model")
    const modelExists = models.some(model => model.id === currentModel)
    if (!modelExists && models.length > 0) {
      form.setValue("model", models[0].id)
    }
  }, [watchedProvider, form])

  // Initialize available models on component mount
  useEffect(() => {
    const provider = form.getValues("provider")
    const models = modelsByProvider[provider] || modelsByProvider.openai
    setAvailableModels(models)
  }, [form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values)
    onClose()
  }

  return (
    <Form {...form}>
      <form id="agent-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Agent Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Content Writer" 
                    className="bg-white/5 border-white/10 h-11 focus:ring-teal-500/20" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">AI Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-black/95 border-white/10">
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-400">System Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Define how your agent should behave..."
                  rows={8}
                  className="bg-white/5 border-white/10 resize-none focus:ring-teal-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Model</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-black/95 border-white/10 border-teal-500/20">
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Max Tokens</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-white/5 border-white/10 h-11 focus:ring-teal-500/20"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-400">
                Temperature: {field.value.toFixed(1)}
              </FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
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

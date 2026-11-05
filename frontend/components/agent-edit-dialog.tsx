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
import api from "@/lib/store/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, KeyRound, Loader2 } from "lucide-react"
import { PROVIDERS, asProvider, ignoresTemperature, providerInfo, providerName } from "@/lib/providers"
import { useApiKeys } from "@/hooks/use-api-keys"
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
  name: z.string().min(2, {
    message: "Give the agent a name (2 or more characters).",
  }),
  systemPrompt: z.string().min(10, {
    message: "Describe the agent in at least 10 characters.",
  }),
  provider: z.enum(["openai", "gemini", "deepseek"], {
    required_error: "Please select a provider.",
  }),
  model: z.string().min(1, {
    message: "Please select a model.",
  }),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(10000),
  tools: z.array(z.string()),
})

const TOKEN_PRESETS = [500, 1000, 2000, 4000]

function temperatureWord(t: number) {
  if (t <= 0.3) return "Precise"
  if (t <= 0.7) return "Balanced"
  return "Creative"
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function AgentEditForm({
  agent,
  onSave,
  onClose,
}: { agent: Agent | null; onSave: (data: Partial<Agent>) => void; onClose: () => void; isLoading?: boolean }) {
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([])
  // Where the list came from: the provider (latest for this account), or the built-in list
  const [modelSource, setModelSource] = useState<"loading" | "provider" | "builtin">("loading")
  const { isMissing } = useApiKeys()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agent?.name || "",
      systemPrompt: agent?.systemPrompt || "",
      provider: asProvider(agent?.provider),
      model: agent?.model || PROVIDERS[0].models[0].id,
      temperature: agent?.temperature ?? 0.7,
      maxTokens: agent?.maxTokens || 2000,
      tools: agent?.tools || [],
    },
  })

  // Models for the chosen provider. Start from the built-in list, then replace it with the latest models the
  // provider reports for this account (newest first). A new agent gets the newest one by default.
  const watchedProvider = form.watch("provider")
  const watchedModel = form.watch("model")
  const watchedTemperature = form.watch("temperature")
  const watchedPrompt = form.watch("systemPrompt")
  const watchedTokens = form.watch("maxTokens")

  useEffect(() => {
    let cancelled = false
    const builtin = providerInfo(watchedProvider).models
    const current = form.getValues("model")
    const keepsCurrent = !!agent && agent.provider === watchedProvider && agent.model === current
    setAvailableModels(
      keepsCurrent && !builtin.some((m) => m.id === current)
        ? [{ id: current, name: `${current} (current)` }, ...builtin]
        : builtin
    )
    setModelSource("loading")
    if (!keepsCurrent && !builtin.some((m) => m.id === current)) {
      form.setValue("model", builtin[0].id)
    }

    api
      .get(`/keys/${watchedProvider}/models`)
      .then((res) => {
        if (cancelled) return
        const { models, source } = res.data.data as { models: Array<{ id: string; name: string }>; source: string }
        if (source !== "provider" || models.length === 0) {
          setModelSource("builtin")
          return
        }
        const now = form.getValues("model")
        const keeps = !!agent && agent.provider === watchedProvider && agent.model === now
        const list =
          keeps && !models.some((m) => m.id === now) ? [{ id: now, name: `${now} (current)` }, ...models] : models
        setAvailableModels(list)
        setModelSource("provider")
        if (!keeps || !list.some((m) => m.id === now)) {
          form.setValue("model", list[0].id)
        }
      })
      .catch(() => {
        if (!cancelled) setModelSource("builtin")
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedProvider, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values)
    onClose()
  }

  const field = "bg-muted border-border h-11"

  return (
    <Form {...form}>
      <form id="agent-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-9 px-1 pb-8 pt-1">
        <Section title="Identity">
          <FormField
            control={form.control}
            name="name"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Content Writer" className={field} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field: f }) => (
              <FormItem>
                <div className="flex items-baseline justify-between">
                  <FormLabel>What should it do?</FormLabel>
                  <span className="text-xs tabular-nums text-muted-foreground">{watchedPrompt.length} characters</span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe its role, tone and rules. For example: You are a concise research assistant. Cite sources."
                    rows={7}
                    className="bg-muted border-border resize-none leading-relaxed"
                    {...f}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Model" hint="Pick who answers. You bring the key, so usage is billed to your account.">
          <FormField
            control={form.control}
            name="provider"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel className="sr-only">Provider</FormLabel>
                <FormControl>
                  <div role="radiogroup" aria-label="Provider" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {PROVIDERS.map((p) => {
                      const selected = f.value === p.id
                      const missing = isMissing(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => f.onChange(p.id)}
                          className={cn(
                            "flex min-h-[4.25rem] flex-col items-start justify-between rounded-lg border px-3.5 py-3 text-left transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted hover:border-foreground/30"
                          )}
                        >
                          <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold">
                            {p.label}
                            {selected && <Check className="h-4 w-4 text-primary" aria-hidden />}
                          </span>
                          <span
                            className={cn(
                              "mt-2 flex items-center gap-1.5 text-xs",
                              missing ? "text-error-text" : "text-muted-foreground"
                            )}
                          >
                            <KeyRound className="h-3 w-3" aria-hidden />
                            {missing ? "No key yet" : "Key ready"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </FormControl>
                {isMissing(watchedProvider) && (
                  <p className="text-xs text-muted-foreground">
                    Add your {providerName(watchedProvider)} key in Profile before you chat with this agent.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <Select onValueChange={(v) => v && f.onChange(v)} value={f.value}>
                  <FormControl>
                    <SelectTrigger className={field}>
                      <SelectValue placeholder="Select a model">
                        {availableModels.find((m) => m.id === f.value)?.name ?? f.value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border">
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {modelSource === "loading"
                    ? "Checking for the latest models..."
                    : modelSource === "provider"
                      ? "Latest models available to your account, newest first."
                      : `Built-in list. Add your ${providerName(watchedProvider)} key in Profile to see the latest models.`}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Behaviour">
          <FormField
            control={form.control}
            name="temperature"
            render={({ field: f }) => {
              const ignored = ignoresTemperature(watchedProvider, watchedModel)
              return (
                <FormItem className={cn(ignored && "opacity-60")}>
                  <div className="flex items-baseline justify-between">
                    <FormLabel>Creativity</FormLabel>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {temperatureWord(f.value)} · {f.value.toFixed(1)}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[f.value]}
                      onValueChange={([value]) => f.onChange(value)}
                      min={0}
                      max={1}
                      step={0.1}
                      disabled={ignored}
                      className="mt-3"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Same answer each time</span>
                    <span>More varied</span>
                  </div>
                  {ignored && (
                    <p className="text-xs text-muted-foreground">This model sets its own creativity, so this has no effect.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Reply length limit</FormLabel>
                <div className="flex flex-wrap items-center gap-2">
                  {TOKEN_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={watchedTokens === n}
                      onClick={() => f.onChange(n)}
                      className={cn(
                        "h-9 rounded-md border px-3 text-sm tabular-nums transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        watchedTokens === n
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {n.toLocaleString()}
                    </button>
                  ))}
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      aria-label="Custom maximum tokens"
                      className="h-9 w-28 bg-muted border-border tabular-nums"
                      {...f}
                      onChange={(e) => f.onChange(Number.parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                <p className="text-xs text-muted-foreground">About 750 words per 1,000 tokens. Up to 10,000.</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>
      </form>
    </Form>
  )
}

export function AgentEditDialog({ open, onOpenChange, agent, onSave, isLoading }: AgentEditDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-popover border-border max-w-2xl h-[90vh] !flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 pb-4 flex-shrink-0 border-b border-border">
            <DialogTitle className="text-3xl font-bold tracking-tight">
              {agent ? "Edit Agent" : "Create New Agent"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-lg">
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

          <DialogFooter className="p-8 pt-4 border-t border-border flex-shrink-0 bg-card">
            <Button
              type="submit"
              form="agent-form"
              size="lg"
              className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
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
              className="px-8 text-muted-foreground hover:text-foreground h-12"
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
      <DrawerContent className="bg-popover border-border h-[96dvh] max-h-[96dvh] flex flex-col p-0 rounded-t-md overflow-hidden">
        <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-1 shrink-0" />
        <DrawerHeader className="p-6 pb-2 flex-shrink-0 text-left">
          <DrawerTitle className="text-2xl font-bold">{agent ? "Edit Agent" : "New Agent"}</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">Configure your AI assistant.</DrawerDescription>
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

        <DrawerFooter className="p-6 pt-4 pb-12 border-t border-border flex-shrink-0 flex flex-row gap-3 bg-card">
          <Button
            type="submit"
            form="agent-form"
            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-md"
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
              className="flex-1 h-14 border-border text-foreground/80 font-semibold text-lg rounded-md"
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

"use client"

import { useCallback, useEffect, useState } from "react"
import { KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/store/api"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Provider = "openai" | "gemini"

interface KeysState {
  keys: { provider: Provider; hint: string; updatedAt: string }[]
  sharedKey: Record<Provider, boolean>
  canSave: boolean
}

const PROVIDERS: { id: Provider; label: string; placeholder: string; where: string }[] = [
  { id: "openai", label: "OpenAI", placeholder: "sk-...", where: "platform.openai.com/api-keys" },
  { id: "gemini", label: "Google Gemini", placeholder: "AIza...", where: "aistudio.google.com/apikey" },
]

const messageOf = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

/** Lets a signed-in user save their own OpenAI and Gemini keys. The server stores them encrypted and never sends them back. */
export function ApiKeysCard() {
  const [state, setState] = useState<KeysState | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [drafts, setDrafts] = useState<Record<Provider, string>>({ openai: "", gemini: "" })
  const [busy, setBusy] = useState<Provider | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await api.get("/keys")
      setState(res.data.data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async (provider: Provider) => {
    setBusy(provider)
    try {
      await api.put(`/keys/${provider}`, { apiKey: drafts[provider].trim() })
      setDrafts((d) => ({ ...d, [provider]: "" }))
      toast.success("Key saved")
      await load()
    } catch (error) {
      toast.error(messageOf(error, "Could not save the key. Try again."))
    } finally {
      setBusy(null)
    }
  }

  const remove = async (provider: Provider) => {
    setBusy(provider)
    try {
      await api.delete(`/keys/${provider}`)
      toast.success("Key removed")
      await load()
    } catch (error) {
      toast.error(messageOf(error, "Could not remove the key. Try again."))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Panel className="p-6">
      <div className="mb-2 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-foreground" />
        <h2 className="text-xl font-semibold">API keys</h2>
      </div>
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        Add your own key and your agents use it for chat, so the usage is billed to your account. Keys are encrypted on
        the server and are never shown again after you save them.
      </p>

      {loadError && <p className="text-sm text-error-text">Could not load your keys. Refresh the page to try again.</p>}
      {!loadError && !state && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />}

      {state && (
        <div className="space-y-6">
          {!state.canSave && (
            <p className="text-sm text-error-text">Saving keys is not set up on this server yet.</p>
          )}
          {PROVIDERS.map((p) => {
            const saved = state.keys.find((k) => k.provider === p.id)
            const id = `key-${p.id}`
            return (
              <div key={p.id} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Label htmlFor={id} className="text-base">
                    {p.label}
                  </Label>
                  <p className="text-sm text-muted-foreground" aria-live="polite">
                    {saved
                      ? `Your key ending ${saved.hint} is in use`
                      : state.sharedKey[p.id]
                        ? "Using the shared key"
                        : "No key yet. Chat with this provider needs one"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id={id}
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={saved ? "Paste a new key to replace it" : p.placeholder}
                    value={drafts[p.id]}
                    disabled={!state.canSave || busy !== null}
                    onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => save(p.id)}
                      disabled={!state.canSave || busy !== null || drafts[p.id].trim().length === 0}
                    >
                      {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      {saved ? "Replace" : "Save"}
                    </Button>
                    {saved && (
                      <Button type="button" variant="outline" onClick={() => remove(p.id)} disabled={busy !== null}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Get one at {p.where}</p>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

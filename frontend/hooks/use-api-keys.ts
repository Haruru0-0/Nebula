"use client"

import { useCallback, useEffect, useState } from "react"
import api from "@/lib/store/api"
import { asProvider, providerName, type Provider } from "@/lib/providers"

export type { Provider }
export { providerName }

interface KeysState {
  keys: { provider: Provider; hint: string; updatedAt: string }[]
  sharedKey: Record<Provider, boolean>
  canSave: boolean
}

/**
 * What keys the signed-in user has. `isMissing(provider)` is true only once the answer is known and neither the
 * user nor the server has a key for that provider, so nothing flashes a warning while loading.
 */
export function useApiKeys() {
  const [state, setState] = useState<KeysState | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/keys")
      setState(res.data.data)
    } catch {
      setState(null)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isMissing = useCallback(
    (provider?: string) => {
      if (!state) return false
      const p = asProvider(provider)
      return !state.keys.some((k) => k.provider === p) && !state.sharedKey[p]
    },
    [state]
  )

  return { loaded: state !== null, isMissing, refresh }
}

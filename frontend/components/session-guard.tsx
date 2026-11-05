"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import { useAppDispatch } from "@/lib/store/store"
import { logout } from "@/lib/store/slices/auth/profileSlice"
import api from "@/lib/store/api"
import { SESSION_CHANGED_EVENT, SESSION_EXPIRED_EVENT, getSessionExpiry, setSessionExpiry } from "@/lib/session"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// setTimeout cannot wait longer than this (about 24 days)
const MAX_TIMER_MS = 2_147_483_647

/**
 * Ends the session when the login runs out, even if the person is idle on the page: it clears the login cookie,
 * tells them the session is over, and sends them to sign in again. A 401 from the API (see lib/store/api.ts) ends
 * it the same way. If nobody had signed in on this page, a 401 just sends them to the sign-in page.
 */
export function SessionGuard() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [expired, setExpired] = useState(false)
  const done = useRef(false)

  const expire = useCallback(
    (wasSignedIn = true) => {
      if (done.current) return
      done.current = true
      setSessionExpiry(null)
      dispatch(logout()) // forget the user in memory
      api.post("/auth/logout").catch(() => {}) // and drop the cookie
      if (wasSignedIn) setExpired(true)
      else router.replace("/auth/sign-in")
    },
    [dispatch, router]
  )

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const check = () => {
      if (timer) clearTimeout(timer)
      const exp = getSessionExpiry()
      if (exp === null) return // not known yet (the profile request sets it) or not signed in
      const left = exp - Date.now()
      if (left <= 0) {
        expire(true)
        return
      }
      done.current = false
      timer = setTimeout(check, Math.min(left + 250, MAX_TIMER_MS))
    }

    check()
    // Background tabs throttle timers, so look again when the person comes back
    const onVisible = () => document.visibilityState === "visible" && check()
    const onExpired = (e: Event) => expire((e as CustomEvent<{ wasSignedIn?: boolean }>).detail?.wasSignedIn ?? true)
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    window.addEventListener(SESSION_CHANGED_EVENT, check)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", check)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
      window.removeEventListener(SESSION_CHANGED_EVENT, check)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", check)
    }
  }, [expire])

  return (
    <AlertDialog open={expired}>
      <AlertDialogContent
        className="bg-popover border-border"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <AlertDialogTitle>Your session has ended</AlertDialogTitle>
          <AlertDialogDescription>
            For your security you were signed out. Sign in again to carry on where you left off.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.push("/auth/sign-in")}>Sign in again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

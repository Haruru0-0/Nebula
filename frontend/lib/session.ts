// The login itself is HttpOnly cookies the page cannot read. The server tells us when the whole sign-in ends (not
// the 15-minute access token, which is renewed quietly), and that one non-secret number is kept in memory so the
// app can say "session ended" on time. A reload loses it; the profile request restores it.

export const SESSION_EXPIRED_EVENT = "nebula:session-expired"
export const SESSION_CHANGED_EVENT = "nebula:session-changed"

let expiresAt: number | null = null

export function setSessionExpiry(ms: number | null | undefined): void {
  expiresAt = typeof ms === "number" ? ms : null
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

export function getSessionExpiry(): number | null {
  return expiresAt
}

/** Tell the app the login was refused or has run out. `wasSignedIn` is false when nobody had signed in on this page. */
export function announceSessionExpired(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { wasSignedIn: expiresAt !== null } }))
}

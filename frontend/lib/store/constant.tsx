// Normal API calls go to this same-origin path. Next rewrites it to the backend (see next.config.mjs), so the login
// cookie belongs to the frontend's own domain and works whichever host the backend runs on.
export const SERVER_ADDR = "/api"

// The backend's own address, for the two things that cannot go through the proxy: the streamed chat reply and the
// live-metrics socket. They authenticate with a one-minute token instead of the cookie.
export const DIRECT_API_ADDR =
  process.env.NEXT_PUBLIC_DIRECT_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

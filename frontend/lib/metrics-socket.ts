import { io, type Socket } from "socket.io-client"
import api from "@/lib/store/api"
import { DIRECT_API_ADDR } from "@/lib/store/constant"

/**
 * Opens the live-metrics socket. The login cookie is not sent to the socket server, so the API hands out a
 * one-minute token for the handshake.
 */
export async function openMetricsSocket(): Promise<Socket> {
  const res = await api.get<{ data: { token: string } }>("/auth/socket-token")
  const socketUrl = DIRECT_API_ADDR.replace(/\/api\/?$/, "")
  return io(`${socketUrl}/metrics`, { auth: { token: res.data.data.token } })
}

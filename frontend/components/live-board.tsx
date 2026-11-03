"use client"

import { useEffect, useState } from "react"
import { Flap } from "@/components/flap"
import { cn } from "@/lib/utils"

type Status = "ONLINE" | "IDLE"

interface Row {
  name: string
  model: string
  status: Status
  latency: number
  tokens: number
}

const START: Row[] = [
  { name: "support-bot", model: "gpt-5-mini", status: "ONLINE", latency: 1204, tokens: 48210 },
  { name: "research-agent", model: "gemini-3.0-flash", status: "ONLINE", latency: 860, tokens: 129034 },
  { name: "code-review", model: "gpt-5", status: "IDLE", latency: 0, tokens: 8120 },
  { name: "summarizer", model: "gemini-3.0-pro", status: "ONLINE", latency: 412, tokens: 20977 },
]

const fmt = (n: number) => (n === 0 ? "-" : n.toLocaleString("en-US"))
const jitter = (n: number, spread: number) => Math.max(120, Math.round(n + (Math.random() - 0.5) * spread))

/**
 * A sample agent board for the landing page. Every number is made up, and the board says so.
 * Rows change every few seconds, flipping only the cells that changed. With reduced motion it stays still.
 */
export function LiveBoard() {
  const [rows, setRows] = useState<Row[]>(START)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      const i = Math.floor(Math.random() * START.length)
      setActive(i)
      setRows((prev) =>
        prev.map((row, idx) => {
          if (idx !== i) return row
          const waking = row.status === "IDLE"
          return {
            ...row,
            status: "ONLINE",
            latency: jitter(row.latency || 700, 500),
            tokens: row.tokens + (waking ? 340 : Math.round(120 + Math.random() * 900)),
          }
        })
      )
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="rounded-md bg-card p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-sm bg-marker px-3 py-2 text-marker-foreground">
        <span className="font-flap text-base font-semibold sm:text-lg">Agent board</span>
        <span className="text-xs sm:text-sm">Sample data</span>
      </div>
      <table className="w-full text-left">
        <caption className="sr-only">Sample agent board with made-up numbers</caption>
        <thead>
          <tr className="text-xs text-muted-foreground sm:text-sm">
            <th scope="col" className="w-5 pb-2 font-normal"><span className="sr-only">Last active</span></th>
            <th scope="col" className="pb-2 font-normal">Agent</th>
            <th scope="col" className="hidden pb-2 font-normal md:table-cell">Model</th>
            <th scope="col" className="pb-2 font-normal">Status</th>
            <th scope="col" className="pb-2 text-right font-normal">Latency (ms)</th>
            <th scope="col" className="hidden pb-2 text-right font-normal lg:table-cell">Tokens today</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.name} className="border-t border-border text-base sm:text-lg">
              <td className="py-2.5 pr-2">
                <span
                  aria-hidden
                  className={cn("block h-2.5 w-2.5 rounded-[1px]", i === active ? "bg-marker" : "bg-transparent")}
                />
              </td>
              <td className="py-2.5 pr-3"><Flap text={row.name} /></td>
              <td className="hidden py-2.5 pr-3 text-sm text-muted-foreground md:table-cell">{row.model}</td>
              <td className="py-2.5 pr-3"><Flap text={row.status} className="text-sm sm:text-base" /></td>
              <td className="py-2.5 text-right"><Flap text={fmt(row.latency)} /></td>
              <td className="hidden py-2.5 text-right lg:table-cell"><Flap text={fmt(row.tokens)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

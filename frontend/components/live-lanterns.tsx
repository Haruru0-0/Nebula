"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Agent {
  name: string
  model: string
  lit: boolean
  latency: number
  tokens: number
  height: string
}

const START: Agent[] = [
  { name: "support-bot", model: "gpt-5-mini", lit: true, latency: 1204, tokens: 48210, height: "min-h-[210px]" },
  { name: "research-agent", model: "gemini-3.0-flash", lit: true, latency: 860, tokens: 129034, height: "min-h-[250px]" },
  { name: "summarizer", model: "gemini-3.0-pro", lit: true, latency: 412, tokens: 20977, height: "min-h-[190px]" },
  { name: "code-review", model: "gpt-5", lit: false, latency: 0, tokens: 8120, height: "min-h-[210px]" },
]

const fmt = (n: number) => n.toLocaleString("en-US")
const jitter = (n: number, spread: number) => Math.max(120, Math.round(n + (Math.random() - 0.5) * spread))

/**
 * Sample agents as glass lanterns: lit from inside means the agent is working, a dashed outline means idle.
 * Every number is made up and labelled so. On load the lanterns light in turn; then one brightens every few
 * seconds as its numbers change and the red seal moves to it. With reduced motion everything is lit and still.
 */
export function LiveLanterns() {
  const [agents, setAgents] = useState<Agent[]>(START)
  const [active, setActive] = useState(0)
  const [bump, setBump] = useState(0)
  const [lighting, setLighting] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLighting(false)
      return
    }
    const done = setTimeout(() => setLighting(false), 2300)
    const id = setInterval(() => {
      const lit = START.flatMap((a, i) => (a.lit ? [i] : []))
      const i = lit[Math.floor(Math.random() * lit.length)]
      setActive(i)
      setBump((b) => b + 1)
      setAgents((prev) =>
        prev.map((a, idx) =>
          idx === i ? { ...a, latency: jitter(a.latency, 500), tokens: a.tokens + Math.round(120 + Math.random() * 900) } : a
        )
      )
    }, 3200)
    return () => {
      clearTimeout(done)
      clearInterval(id)
    }
  }, [])

  return (
    <section aria-label="Sample agents, with made-up numbers" className="relative">
      <div aria-hidden className="spill breathe left-[2%] top-[30%] h-[260px] w-[420px]" />
      <div aria-hidden className="spill breathe right-[6%] top-[34%] h-[260px] w-[380px]" />
      <ul className="relative grid grid-cols-1 items-end gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent, i) =>
          agent.lit ? (
            <li
              key={agent.name}
              className={cn(
                "glass lit list-none flex flex-col justify-between p-6",
                agent.height,
                lighting && "lighting",
                !lighting && i === active && bump > 0 && "bump"
              )}
              style={lighting ? ({ "--d": `${i * 0.45}s` } as React.CSSProperties) : undefined}
            >
              <div>
                <p className="text-lg font-semibold leading-tight">{agent.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{agent.model}</p>
              </div>
              <div>
                <p className="text-4xl font-semibold leading-none tracking-tight tabular-nums">
                  {fmt(agent.latency)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">ms</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">response time</p>
                <p className="mt-2 text-sm tabular-nums">{fmt(agent.tokens)} tokens today</p>
              </div>
              {i === active && !lighting && (
                <span
                  aria-label="Last to answer"
                  className="stamp absolute right-4 top-4 z-10 h-2.5 w-2.5 rounded-[2px] bg-marker"
                />
              )}
            </li>
          ) : (
            <li key={agent.name} className={cn("flat list-none flex flex-col justify-between p-6", agent.height)}>
              <div>
                <p className="text-lg font-semibold leading-tight text-foreground">{agent.name}</p>
                <p className="mt-0.5 text-xs">{agent.model}</p>
              </div>
              <p className="text-sm">Idle. Folded flat until it is called.</p>
            </li>
          )
        )}
      </ul>
      <p className="relative mt-6 text-sm text-muted-foreground">
        Sample data. A tile lit from inside is an agent that is working; the red seal marks the last one to answer.
      </p>
    </section>
  )
}

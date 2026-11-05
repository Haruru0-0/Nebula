"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Count } from "@/components/count"
import { Lens } from "@/components/glass-lens"

interface Agent {
  name: string
  model: string
  lit: boolean
  latency: number
  tokens: number
  height: number
}

const START: Agent[] = [
  { name: "support-bot", model: "gpt-5-mini", lit: true, latency: 1204, tokens: 48210, height: 210 },
  { name: "research-agent", model: "gemini-3.8-flash", lit: true, latency: 860, tokens: 129034, height: 250 },
  { name: "summarizer", model: "gemini-3.1-pro", lit: true, latency: 412, tokens: 20977, height: 190 },
  { name: "code-review", model: "gpt-5", lit: false, latency: 0, tokens: 8120, height: 210 },
]

const jitter = (n: number, spread: number) => Math.max(120, Math.round(n + (Math.random() - 0.5) * spread))

/**
 * Sample agents as liquid-glass lanterns: lit from inside means the agent is working, a dashed outline means idle.
 * Every number is made up and labelled so. On load the lanterns rise and light in turn; then one flares every few
 * seconds as its numbers count up and the red seal glides to it. With reduced motion everything is lit and still.
 */
export function LiveLanterns() {
  const reduce = useReducedMotion() ?? false
  const [agents, setAgents] = useState<Agent[]>(START)
  const [active, setActive] = useState(0)
  const [flare, setFlare] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      const lit = START.flatMap((a, i) => (a.lit ? [i] : []))
      const i = lit[Math.floor(Math.random() * lit.length)]
      setActive(i)
      setFlare((f) => f + 1)
      setAgents((prev) =>
        prev.map((a, idx) =>
          idx === i ? { ...a, latency: jitter(a.latency, 500), tokens: a.tokens + Math.round(120 + Math.random() * 900) } : a
        )
      )
    }, 3400)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <section aria-label="Sample agents, with made-up numbers" className="relative">
      <ul className="relative grid grid-cols-1 items-end gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent, i) => (
          <motion.li
            key={agent.name}
            className="list-none"
            initial={reduce ? false : { opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={reduce ? undefined : { y: -6 }}
            transition={{ type: "spring", stiffness: 110, damping: 16, delay: reduce ? 0 : 0.15 + i * 0.14 }}
          >
            {agent.lit ? (
              <div className="relative">
                {/* the light this lantern throws on the room below */}
                <motion.div
                  aria-hidden
                  className="absolute -bottom-5 left-6 right-6 h-10 rounded-full bg-light blur-2xl"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: i === active && flare > 0 ? [0.5, 0.9, 0.5] : 0.5 }}
                  transition={{ duration: 1.1, delay: i === active && flare > 0 ? 0 : 0.6 + i * 0.45 }}
                />
                <Lens height={agent.height} cornerRadius={28}>
                  <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[28px] p-6" style={{ height: agent.height }}>
                    <motion.div
                      aria-hidden
                      key={i === active ? `flare-${flare}` : "rest"}
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(85% 70% at 50% 108%, rgba(241,217,166,0.78), rgba(241,217,166,0.26) 50%, transparent 82%)",
                      }}
                      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                      animate={i === active && flare > 0 ? { opacity: [0.7, 1, 0.85], scale: [1, 1.14, 1] } : { opacity: 0.85, scale: 1 }}
                      transition={{ duration: i === active && flare > 0 ? 1.2 : 1.4, delay: i === active && flare > 0 ? 0 : 0.6 + i * 0.45 }}
                    />
                    <div className="relative">
                      <p className="text-lg font-semibold leading-tight">{agent.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{agent.model}</p>
                    </div>
                    <div className="relative">
                      <p className="text-4xl font-semibold leading-none tracking-tight tabular-nums">
                        <Count value={agent.latency} reduce={reduce} />
                        <span className="ml-1 text-sm font-normal text-muted-foreground">ms</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">response time</p>
                      <p className="mt-2 text-sm tabular-nums">
                        <Count value={agent.tokens} reduce={reduce} /> tokens today
                      </p>
                    </div>
                    {i === active && (
                      <motion.span
                        layoutId="seal"
                        aria-label="Last to answer"
                        className="absolute right-4 top-4 z-10 h-2.5 w-2.5 rounded-[2px] bg-marker"
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      />
                    )}
                  </div>
                </Lens>
              </div>
            ) : (
              <div className="flat flex flex-col justify-between p-6" style={{ height: agent.height }}>
                <div>
                  <p className="text-lg font-semibold leading-tight text-foreground">{agent.name}</p>
                  <p className="mt-0.5 text-xs">{agent.model}</p>
                </div>
                <p className="text-sm">Idle. Folded flat until it is called.</p>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
      <p className="relative mt-8 text-sm text-muted-foreground">
        Sample data. A tile lit from inside is an agent that is working; the red seal marks the last one to answer.
      </p>
    </section>
  )
}

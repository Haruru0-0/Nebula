"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface FlapProps {
  text: string | number
  /** Font size of the cells, e.g. "1rem". Defaults to the surrounding size. */
  className?: string
  /** Flip cells whose character changed since the last render. */
  animate?: boolean
}

/**
 * Text set on split-flap cards, one cell per character. Cells that change flip into place.
 * With reduced motion the flip is removed in CSS, so the new character just appears.
 */
export function Flap({ text, className, animate = true }: FlapProps) {
  const value = String(text)
  const previous = useRef<string | null>(null)

  useEffect(() => {
    previous.current = value
  })

  const before = previous.current
  return (
    <span className={cn("inline-flex flex-wrap items-center whitespace-pre", className)} aria-label={value} role="img">
      {[...value].map((char, i) => {
        if (char === " ") return <span key={i} className="flap-gap" aria-hidden />
        const changed = animate && before !== null && before[i] !== char
        // A new key remounts the cell so its flip animation plays once
        return (
          <span key={`${i}-${char}`} className={cn("flap", changed && "flap-flip")} aria-hidden>
            {char}
          </span>
        )
      })}
    </span>
  )
}

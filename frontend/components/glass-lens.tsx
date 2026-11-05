"use client"

import { useEffect, useRef, useState, type ComponentProps } from "react"
import LiquidGlass from "liquid-glass-react"
import { useReducedMotion } from "motion/react"

type LensProps = Omit<ComponentProps<typeof LiquidGlass>, "elasticity" | "padding"> & {
  /** The lens sizes itself from its content, so it needs a known height. */
  height: number
  /** How much the glass squishes toward the pointer. Ignored (0) when the person prefers reduced motion. */
  squish?: number
}

/**
 * Real Liquid Glass: the edges bend what is behind them, with a little chromatic fringe and a springy
 * squish toward the pointer (liquid-glass-react). Safari and Firefox only get the frosted part, not the bend.
 * With reduced motion the squish is off.
 *
 * The library measures its content, so this wrapper measures the available width and hands the lens a box with
 * real pixel dimensions; children can then lay out normally (use `h-full w-full` to fill it).
 * Use it on a few key surfaces (nav, tiles, the sign-in card), not on every panel: each lens is an SVG filter.
 */
export function Lens({ children, height, squish = 0.18, cornerRadius = 28, ...props }: LensProps) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const update = () => setWidth(Math.round(el.getBoundingClientRect().width))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <LiquidGlass
          displacementScale={reduce ? 36 : 78}
          blurAmount={0.12}
          saturation={150}
          aberrationIntensity={1.6}
          elasticity={reduce ? 0 : squish}
          cornerRadius={cornerRadius}
          padding="0px"
          style={{ position: "absolute", top: "50%", left: "50%" }}
          {...props}
        >
          <div style={{ width, height }}>{children}</div>
        </LiquidGlass>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface GlowBackgroundProps {
  className?: string
  showOrb?: boolean
  orbPosition?: "center" | "top" | "bottom"
  children?: React.ReactNode
}

export function GlowBackground({ className, showOrb = true, orbPosition = "center", children }: GlowBackgroundProps) {
  const orbPositionClasses = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    top: "top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2",
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Stars/Dots Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
      </div>

      {/* Glowing Orb */}
      {showOrb && (
        <div className={cn("absolute pointer-events-none", orbPositionClasses[orbPosition])}>
          <div className="relative">
            {/* Teal/Green glow */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-400/30 via-emerald-500/40 to-cyan-400/30 blur-[120px] animate-pulse" />
            {/* Orange/Yellow glow */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/30 to-yellow-400/20 blur-[100px] animate-pulse [animation-delay:1s]" />
          </div>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  )
}

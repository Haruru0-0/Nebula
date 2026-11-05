import type React from "react"
import { cn } from "@/lib/utils"

/** A calm, near-solid surface for dense content. Glass is for chrome; this is for reading. */
export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card text-card-foreground", className)} {...props}>
      {children}
    </div>
  )
}

/** A glass panel, for floating chrome and the auth forms. */
export function GlassPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass text-foreground", className)} {...props}>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

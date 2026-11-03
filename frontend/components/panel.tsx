import type React from "react"
import { cn } from "@/lib/utils"

/** A flat card on the housing: no glass, no glow, no lift. */
export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-md border border-border bg-card text-card-foreground", className)} {...props}>
      {children}
    </div>
  )
}

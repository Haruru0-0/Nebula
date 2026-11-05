import { cn } from "@/lib/utils"

/** The Nebula mark: a vermilion seal with an N cut out of it. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Nebula" className={cn("h-8 w-8", className)}>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#d4463a" />
      <path d="M9.5 24V8h3.2l6.8 9.6V8h3v16h-3.2l-6.8-9.6V24z" fill="#fff3df" />
    </svg>
  )
}

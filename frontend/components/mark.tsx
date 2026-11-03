import { cn } from "@/lib/utils"

/** The Nebula mark: a flap card with an N, split by the hinge line. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Nebula" className={cn("h-8 w-8", className)}>
      <rect x="1" y="1" width="30" height="30" rx="3" fill="#26282c" />
      <path d="M9.5 24V8h3.2l6.8 9.6V8h3v16h-3.2l-6.8-9.6V24z" fill="#f4f1e8" />
      <rect x="1" y="15.5" width="30" height="1" fill="#0e0f11" />
    </svg>
  )
}

/**
 * The room behind every screen: two faint spills of warm light so the glass always has something to blur.
 * Fixed and behind everything; it never carries information.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="spill breathe left-[-6%] top-[58%] h-[320px] w-[460px] opacity-[0.16]" />
      <div className="spill breathe right-[-4%] top-[8%] h-[300px] w-[420px] opacity-[0.12]" />
    </div>
  )
}

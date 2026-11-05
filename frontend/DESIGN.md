# Design

All of Nebula's frontend (landing, auth, app) in "Glass Lanterns". Tokens and glass classes live in `app/globals.css`. Nebula is dark only. This replaced "The Departure Board" on 2026-11-05 (the author did not like it).

## World
Liquid Glass whose light is the agent. A glass tile lit from inside is a working agent; a dashed outline is an idle one that has folded flat. Merges the author's chosen Lantern Room metaphor with the Liquid Glass material.

## Colour
- Room `#110d0a`: the page. Calm surface `#18120d`: cards for dense content. Popover `#1c150f`. Muted fill `#241a12`. Border `#2e231a`.
- Text `#f3e9d2` (about 14:1 on the room). Muted text `#b9ab91` (about 8:1).
- Light `#f1d9a6`: primary buttons (dark text on them), focus ring, selection, the glow inside lit tiles and charts.
- Seal vermilion `#d4463a`: the only accent. The logo, the active route marker, the last-active mark on a lit tile.
- Errors: text `#ff8f73`; destructive buttons `#c23b32` with white text.
- Glass tint `rgba(22,15,10,0.42)` over a blurred, saturated backdrop; edge `rgba(255,244,220,0.2)`.

## Type
One family: Onest (`font-sans`). Headings 600 with tight tracking (-0.025em at display sizes), numbers tabular. No second typeface.

## Surfaces
- `.glass`: tinted blur (22px, saturate 150%), a bright top edge, a specular corner highlight and an offset soft shadow. Used for the nav pill, lantern tiles and the auth forms (`GlassPanel`).
- `.glass-bar`: the same blur without rounding, for the sidebar and top bar.
- `Panel` (`components/panel.tsx`): calm near-solid card for dense content (agents, chat, analytics, profile). Glass is chrome; this is for reading.
- `.lit` adds light from inside (an inner glow) and a downward cast light, always offset, never a zero-offset halo. `.flat` is the idle dashed outline.
- `Backdrop` (`components/backdrop.tsx`): two faint spills of warm light behind every screen so the glass has something to blur.

## Real Liquid Glass
`components/glass-lens.tsx` wraps `liquid-glass-react`: the edges bend what is behind them, with a slight chromatic fringe and a springy squish toward the pointer. It is used on a few key surfaces (the landing nav and the lantern tiles), not on every panel, because each lens is an SVG filter. The `Backdrop` carries a faint lattice of lantern ribs so the bend is visible at the edges. Safari and Firefox get the frosted glass without the bend.

## Motion
Built with `motion`. Landing: the lanterns rise and light in turn, then one flares every few seconds as its numbers count up and the red seal glides to it (shared-layout animation). App: pages fade and rise on route change, the sidebar highlight and seal glide between routes, metric numbers count up, agent cards and chat messages enter with a short rise, buttons press down, glass cards spring into place. `prefers-reduced-motion` removes all of it (and the lens squish). `prefers-reduced-transparency` and browsers without `backdrop-filter` get solid panels.

## Not used
No lens on dense panels or form cards, no gradients as decoration, no coloured orbs, no second accent.

## Content rules
The landing lanterns are sample data and say so. No agency, services or pricing copy. No customer or performance claims.

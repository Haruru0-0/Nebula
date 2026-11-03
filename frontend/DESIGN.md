# Design

All of Nebula's frontend (landing, auth, app) in "The Departure Board". Tokens live in `app/globals.css`; Nebula is dark only.

## World
A split-flap departure board: every agent is a row, and numbers and status flip into place when they change.

## Colour
- Housing `#0e0f11`: the page. Flap black `#16171a`: cards and the board. Flap card `#26282c`: cells, muted fills.
- Flap type `#f4f1e8`: text and primary buttons (dark text on them). Muted text `#a3a6ad` (about 7:1 on the page).
- Marker amber `#f2b01e`: only the board header band and the single active marker (the last active agent row, the current sidebar route). It is never a button or link colour.
- Red `#e0463a`: errors and destructive actions only.
- Charts use off-white lines and grey grids; amber is not used for data.

## Type
- Flap and headings: Barlow Semi Condensed 500/600 (`font-flap`).
- Body and controls: Public Sans.
- Flap cells (`components/flap.tsx`) show data in the board: names, status, latency, tokens, metric values. Prose never sits in flap cells.

## Components
- `Panel` replaces the old glass card: flat, 1px border, 4px corners, no blur, no hover lift.
- `LiveBoard` (landing): sample agents, labelled "Sample data", one row changes every 2.6 seconds and only changed cells flip. Reduced motion shows it still.
- `MetricCard`: label, flap-cell value, plain-language trend.
- `Mark`: an N on a flap card, split by the hinge line.
- Buttons: off-white fill with dark text (primary) or an outline. No gradients, glows or coloured shadows.

## Motion
One authored moment: the flip. Cells that change flip once (0.22s); everything else is still. `prefers-reduced-motion` removes the flip and the board's updates.

## Content rules
No agency, services or pricing copy. Any numbers shown outside the signed-in app are labelled as sample data.

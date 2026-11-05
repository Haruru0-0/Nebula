# Decisions

Newest first. Reasons marked (inferred) were not stated by the author.

- **2026-11-05: the author did not like The Departure Board** (the committed look) and asked for alternatives. A bolder re-roll gave three: The Score (dance notation), The Lantern Room and a build manual; the author chose the Lantern Room, then asked about Liquid Glass and got a prototype to compare. He then asked about Liquid Glass; after prototypes of both and of a merge, he chose the merge, "Glass Lanterns" (see the next entry).
- **2026-11-05: Nebula is "Glass Lanterns"**: Liquid Glass material with the Lantern Room's meaning. A glass tile lit from inside is a working agent, a dashed outline an idle one; one vermilion seal is the only accent; dense screens use calm `Panel` surfaces and glass is only chrome. Recorded in `frontend/DESIGN.md`. Refraction was left out (Chromium only). See [[architecture]].
- **2026-11-03 (superseded 2026-11-05): Nebula gets its own look, not NotionCraft's.** "The Departure Board" (split-flap sign), chosen by the author from a dealt hand over a switchboard "Patch Bay". It shows what the product is for: live numbers per agent. Recorded in `frontend/DESIGN.md`. See [[architecture]].
- **2026-11-03 (superseded): amber is only a marker.** The header band and the single active row or route. Never a button or link colour. Red is for errors only (inferred: keeps the board readable).
- **2026-11-03: landing copy describes the product, not an agency.** The old copy (services, five-step process, subscription) was a leftover template and untrue.
- **2026-11-03: sample numbers are labelled** and use the app's real model ids. No customer or performance claims exist.
- **2026-11-03: API address comes from `NEXT_PUBLIC_API_URL`** (default the production Render URL) so the frontend can run against a local backend.
- **Audience:** recruiters and engineers (portfolio piece first). In `frontend/PRODUCT.md`.
- **Database is Neon**, not Supabase. The backend uses the Neon HTTP driver.
- **Work lands on `main`.** Pushes mirror to GitLab.

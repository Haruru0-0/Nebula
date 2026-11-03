# Decisions

Newest first. Reasons marked (inferred) were not stated by the author.

- **2026-11-03: Nebula gets its own look, not NotionCraft's.** "The Departure Board" (split-flap sign), chosen by the author from a dealt hand over a switchboard "Patch Bay". It shows what the product is for: live numbers per agent. Recorded in `frontend/DESIGN.md`. See [[architecture]].
- **2026-11-03: amber is only a marker.** The header band and the single active row or route. Never a button or link colour. Red is for errors only (inferred: keeps the board readable).
- **2026-11-03: landing copy describes the product, not an agency.** The old copy (services, five-step process, subscription) was a leftover template and untrue.
- **2026-11-03: sample numbers are labelled** and use the app's real model ids. No customer or performance claims exist.
- **2026-11-03: API address comes from `NEXT_PUBLIC_API_URL`** (default the production Render URL) so the frontend can run against a local backend.
- **Audience:** recruiters and engineers (portfolio piece first). In `frontend/PRODUCT.md`.
- **Database is Neon**, not Supabase. The backend uses the Neon HTTP driver.
- **Work lands on `main`.** Pushes mirror to GitLab.

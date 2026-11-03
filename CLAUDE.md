# Nebula

AI agent control center: create LLM agents, chat with them, watch live metrics. Monorepo: `backend/` (Express, TypeScript, Neon Postgres, Drizzle, Socket.io) and `frontend/` (Next.js 16, React 19, Tailwind 4, Redux Toolkit).

## Commands
- Backend (`cd backend`): `yarn dev` (port 4000), `yarn build`, `yarn db:push` (create tables), `yarn db:studio`. Needs `backend/.env` (copy `.env.example`; Neon `DATABASE_URL`, both AI keys, SMTP and `EMAIL_FROM`).
- Frontend (`cd frontend`): `yarn dev` (use `-p 3001` if 3000 is busy), `npx tsc --noEmit`. Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `frontend/.env.local` to use a local backend.
- There is no ESLint config in either package.

## Conventions
- Default branch is `main`. Commit messages are plain, with no `Co-Authored-By` trailer.
- The frontend look is "The Departure Board" (`frontend/DESIGN.md`, tokens in `frontend/app/globals.css`). Amber is only the active marker; red is errors only; no gradients or glass. Product truth is in `frontend/PRODUCT.md`.
- Respect `prefers-reduced-motion`; keep text contrast at WCAG AA. Numbers shown outside the signed-in app must be labelled sample data.
- Backend logs in `backend/logs/` are git-ignored; do not add them back.

## Memory and code map
- At session start read `docs/memory/index.md`. Save durable decisions there as Markdown (`decisions.md`, `gotchas.md`, and so on).
- `graphify-out/GRAPH_REPORT.md` summarizes code structure when present; refresh with `python -m graphify update .` (on this machine `graphify.exe` is blocked by Application Control, so use the module form; check the report's "Built from commit" against `git rev-parse HEAD`).

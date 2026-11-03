# Gotchas

See [[architecture]] for the pieces involved.

- **Database must be Neon.** `backend/src/drizzle/db.ts` uses `drizzle-orm/neon-http`. A Supabase or plain Postgres URL will not work. Create tables with `yarn db:push` in `backend/` (reads `backend/.env`).
- **Both AI keys are needed to start.** `src/utils/config.ts` calls `must()` on `OPENAI_API_KEY` and `GEMINI_API_KEY`, so the server exits without them. For local work set the unused one to any placeholder; chat with that provider then fails, everything else works.
- **`EMAIL_FROM` is required for emails** (used as the sender in `emailService.ts`) and was missing from `.env.example` until 2026-11-03. SMTP defaults are Gmail (`smtp.gmail.com`, 587); `SMTP_PASSWORD` must be a Google app password.
- **CORS origin has two names:** `app.ts` reads `CLIENT_URL`, `config.ts` reads `CORS_ORIGIN`. Set both to the frontend's address.
- **Local ports:** backend 4000. The frontend defaults to 3000, which can clash with another app; use `next dev -p 3001` and set `CLIENT_URL` and `CORS_ORIGIN` to match.
- **The frontend defaults to the production API.** Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `frontend/.env.local` to use a local backend.
- **Backend logs are untracked** (since 2026-11-03; `backend/.gitignore` ignores `logs/` and `*.log`). They are still written to `backend/logs/` while the server runs.
- **Two lockfiles in `frontend/`:** `yarn.lock` is real; `pnpm-lock.yaml` is a stub. Use yarn.
- **No ESLint config in either package,** so `eslint` has nothing to run. Use `npx tsc --noEmit`.
- **Application Control blocks `graphify.exe` on this machine.** Run `python -m graphify update .` instead (approved by the author). Graphify skips `.sql` files until `pip install "graphifyy[sql]"`.
- **The app screens need a login and the backend,** so visual checks of agents, chat, analytics and profile need both running.

# Gotchas

See [[architecture]] for the pieces involved.

- **Database must be Neon.** `backend/src/drizzle/db.ts` uses `drizzle-orm/neon-http`. A Supabase or plain Postgres URL will not work. Create tables with `yarn db:push` in `backend/` (reads `backend/.env`).
- **AI keys are optional on the server now.** `OPENAI_API_KEY` and `GEMINI_API_KEY` in `backend/.env` are only a shared fallback; users can save their own in Profile. With neither, chat returns `API_KEY_MISSING` (HTTP 400, or an SSE error) telling the user to add a key.
- **`KEY_ENCRYPTION_SECRET` is required to save keys** (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Without it, `PUT /api/keys/:provider` returns 503 and the Profile card says saving is not set up. Changing it makes every saved key undecryptable, so users would have to re-enter them. `SKIP_KEY_VERIFY=1` skips the provider check when saving (tests only).
- **`errorHandler` has three parameters,** so Express does not treat it as an error handler; unhandled errors may not get its formatting. Known and not fixed; `ApiKeyMissingError` is handled directly in `chatController`.
- **`EMAIL_FROM` is required for emails** (used as the sender in `emailService.ts`) and was missing from `.env.example` until 2026-11-03. SMTP defaults are Gmail (`smtp.gmail.com`, 587); `SMTP_PASSWORD` must be a Google app password.
- **CORS origin has two names:** `app.ts` reads `CLIENT_URL`, `config.ts` reads `CORS_ORIGIN`. Set both to the frontend's address.
- **Local ports:** backend 4000. The frontend defaults to 3000, which can clash with another app; use `next dev -p 3001` and set `CLIENT_URL` and `CORS_ORIGIN` to match.
- **The frontend defaults to the production API.** Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `frontend/.env.local` to use a local backend.
- **Backend logs are untracked** (since 2026-11-03; `backend/.gitignore` ignores `logs/` and `*.log`). They are still written to `backend/logs/` while the server runs.
- **Two lockfiles in `frontend/`:** `yarn.lock` is real; `pnpm-lock.yaml` is a stub. Use yarn.
- **No ESLint config in either package,** so `eslint` has nothing to run. Use `npx tsc --noEmit`.
- **Application Control blocks `graphify.exe` on this machine.** Run `python -m graphify update .` instead (approved by the author). Graphify skips `.sql` files until `pip install "graphifyy[sql]"`.
- **The app screens need a login and the backend,** so visual checks of agents, chat, analytics and profile need both running.
- **`liquid-glass-react` sizes itself from its content and centres itself in its parent** (top/left 50% with a -50% transform). Percentage-width content measures as zero and the lens collapses. Use the `Lens` wrapper (`components/glass-lens.tsx`): it measures its box and gives the library pixel sizes, so a lens needs a known height. Safari and Firefox show the frost but not the bend. Keep lenses to a few surfaces; each one is an SVG filter.
- **Reduced motion and the lens squish were not tested in a browser** (the code uses `useReducedMotion`).
- **Do not give a page wrapper an opaque background** (`bg-background` and similar): the glass look relies on the fixed `Backdrop` (`components/backdrop.tsx`, in the root layout) showing through, and an opaque wrapper hides it so glass panels look flat. Use `Panel` for calm surfaces and `GlassPanel` or `.glass` for glass.

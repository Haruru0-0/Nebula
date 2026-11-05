# Architecture

Setup traps are in [[gotchas]]; behaviour is in [[features-built]].

Monorepo with two packages: `backend/` (API) and `frontend/` (Next.js app).

## Backend (`backend/src`)
- Express + TypeScript, started with `nodemon --exec ts-node src/server.ts`. Health check at `/health`.
- `routes/` + `controllers/`: `auth` (signup, signin, verify-email, resend-verification, forgot/reset/change-password, profile), `agents` (CRUD), `chat` (send, stream, list/get/rename/delete conversations), `metrics` (overall, per agent).
- `services/llmService.ts` (OpenAI, Google Gemini and DeepSeek; DeepSeek uses the OpenAI SDK with `baseURL` `https://api.deepseek.com`) and `services/emailService.ts` (Nodemailer, sender from `EMAIL_FROM`).
- `middlewares/`: JWT `authenticate` (reads the `nebula_session` cookie, or a Bearer header), request validation, error handler. `utils/`: config (`must()` env checks), jwt, crypto (bcrypt), logger (Winston-style files in `backend/logs/`).
- `services/apiKeyService.ts`, `controllers/keyController.ts`, `routes/keyRoutes.ts`: each user's own OpenAI, Gemini and DeepSeek keys. `PUT/GET/DELETE /api/keys[/:provider]`; keys are encrypted with AES-256-GCM (`utils/secrets.ts`, secret `KEY_ENCRYPTION_SECRET`) into the `api_keys` table and never returned (only the last four characters). `services/modelCatalog.ts` + `GET /api/keys/:provider/models` list the newest chat models the user's key can use (OpenAI by `created`, Gemini by version and tier; dated snapshots, embeddings, image, audio, search and codex models filtered out; cached 10 minutes per user and provider, cleared when the key changes). `llmService` builds a client per request with the user's key, else the shared server key from `.env`, else it throws `ApiKeyMissingError`.
- `websocket/metricsSocket.ts`: Socket.io namespace `/metrics` for live metrics.
- `services/sessionService.ts`: refresh tokens (start, rotate with reuse detection, end one, end all, end others); `utils/authCookie.ts`: the two cookies. `drizzle/schema.ts`: tables `users`, `agents`, `conversations`, `messages`, `metrics`, `api_keys`, `refresh_tokens`. Driver is `drizzle-orm/neon-http` with `@neondatabase/serverless`, so the database must be Neon (see [[gotchas]]).

## Frontend (`frontend/`)
- Next.js 16 (App Router), React 19, Tailwind 4, Radix UI. Redux Toolkit with persistence, `react-markdown` + `remark-gfm` + `rehype-highlight` for chat replies, `motion` (animation) and `liquid-glass-react` (refraction) (`lib/store/slices/{agents,auth,chat,metrics}`), React Hook Form + Zod, Recharts, Socket.io client.
- Routes: `/` landing; `/auth/{sign-in,sign-up,verify-email,forgot-password,reset-password}`; `/app/{agents,chat,analytics,profile}`.
- `lib/store/constant.tsx` exports `SERVER_ADDR` (`/api`, same origin; `next.config.mjs` rewrites it to `BACKEND_URL`) and `DIRECT_API_ADDR` (`NEXT_PUBLIC_DIRECT_API_URL`, the backend itself). Chat streams from `${DIRECT_API_ADDR}/chat/:agentId/stream` and metrics connect to `${origin}/metrics`, both with a one-minute token from `/auth/socket-token`.
- Look: `app/globals.css` tokens and glass classes ("Glass Lanterns", dark only), `components/{backdrop,panel,mark,metric-card,live-lanterns}.tsx`. `Panel` is the calm surface, `GlassPanel` the glass one.

## Flow
Sign up, then an emailed OTP verifies the address, then sign in returns JWTs. Agents belong to a user. Chat posts to an agent, replies stream as server-sent events, and conversations and messages are stored. Metrics (tokens, latency) are recorded per message and pushed live over the `/metrics` socket.

## Deployment
GitHub `Haruru0-0/Nebula`, mirrored to a private GitLab copy by `mirror-to-gitlab.yml` on every push and nightly. Plan: frontend on Vercel, backend on Render now and a home server later; see [[gotchas]] for the proxy and env settings. The old Render URL is `https://nebula-g9er.onrender.com`.

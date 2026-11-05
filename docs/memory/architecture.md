# Architecture

Setup traps are in [[gotchas]]; behaviour is in [[features-built]].

Monorepo with two packages: `backend/` (API) and `frontend/` (Next.js app).

## Backend (`backend/src`)
- Express + TypeScript, started with `nodemon --exec ts-node src/server.ts`. Health check at `/health`.
- `routes/` + `controllers/`: `auth` (signup, signin, verify-email, resend-verification, forgot/reset/change-password, profile), `agents` (CRUD), `chat` (send, stream, list/get/rename/delete conversations), `metrics` (overall, per agent).
- `services/llmService.ts` (OpenAI and Google Gemini) and `services/emailService.ts` (Nodemailer, sender from `EMAIL_FROM`).
- `middlewares/`: JWT `authenticate`, request validation, error handler. `utils/`: config (`must()` env checks), jwt, crypto (bcrypt), logger (Winston-style files in `backend/logs/`).
- `websocket/metricsSocket.ts`: Socket.io namespace `/metrics` for live metrics.
- `drizzle/schema.ts`: tables `users`, `agents`, `conversations`, `messages`, `metrics`. Driver is `drizzle-orm/neon-http` with `@neondatabase/serverless`, so the database must be Neon (see [[gotchas]]).

## Frontend (`frontend/`)
- Next.js 16 (App Router), React 19, Tailwind 4, Radix UI. Redux Toolkit with persistence (`lib/store/slices/{agents,auth,chat,metrics}`), React Hook Form + Zod, Recharts, Socket.io client.
- Routes: `/` landing; `/auth/{sign-in,sign-up,verify-email,forgot-password,reset-password}`; `/app/{agents,chat,analytics,profile}`.
- `lib/store/constant.tsx` exports `SERVER_ADDR` (from `NEXT_PUBLIC_API_URL`, default the production Render API). Chat streams from `${SERVER_ADDR}/chat/:agentId/stream`; metrics connect to `${origin}/metrics`.
- Look: `app/globals.css` tokens and glass classes ("Glass Lanterns", dark only), `components/{backdrop,panel,mark,metric-card,live-lanterns}.tsx`. `Panel` is the calm surface, `GlassPanel` the glass one.

## Flow
Sign up, then an emailed OTP verifies the address, then sign in returns JWTs. Agents belong to a user. Chat posts to an agent, replies stream as server-sent events, and conversations and messages are stored. Metrics (tokens, latency) are recorded per message and pushed live over the `/metrics` socket.

## Deployment
GitHub `Haruru0-0/Nebula`, mirrored to a private GitLab copy by `mirror-to-gitlab.yml` on every push and nightly. The default frontend API is `https://nebula-g9er.onrender.com/api`.

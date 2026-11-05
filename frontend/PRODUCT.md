# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary audience: recruiters and engineers looking at the author's portfolio. Nebula is a portfolio piece first and a working app second. Anyone can still sign up and use it.

Inside the app, the user is a developer or operator who builds LLM-powered agents and wants to configure them, talk to them and see how they perform.

## Product Purpose
An AI agent control center. Users create agents (a name, a system prompt, a provider and model, and parameters like temperature and token limits), chat with them, and watch live metrics: token use, response latency and conversation counts. Success means a visitor understands within seconds that this is a real working tool for managing agents, and sees evidence of how it is built.

## Positioning
(Inferred from the README; the author should confirm.) Agents, chat and metrics in one place: configure an agent, chat with it over a streaming connection with saved history, and watch the numbers update live over a WebSocket. Two providers behind one interface (OpenAI and Google Gemini).

The old landing page described an "AI Automation Agency" with services, a five-step "process" and a subscription. None of that is true of this product and none of it may come back.

## Operating Context
Frontend: Next.js 16, React 19, Tailwind 4, Radix UI, Redux Toolkit with persistence, React Hook Form with Zod, Socket.io client, Recharts. Backend: Node, Express, TypeScript, PostgreSQL (Neon) with Drizzle, JWT auth with bcrypt, Socket.io, Nodemailer for verification and reset emails, OpenAI and Gemini APIs. Routes: landing `/`; auth `/auth/{sign-in,sign-up,verify-email,forgot-password,reset-password}`; app `/app/{agents,chat,analytics,profile}`.

## Capabilities and Constraints
- Agents: create, edit, delete; customizable system prompts; provider and model selection; temperature and max tokens.
- Chat: streaming replies (SSE), persistent conversations, delete conversations.
- Analytics: token usage, response latency, conversation analytics, live updates.
- Auth: email and password with email verification and password reset.
- Must respect `prefers-reduced-motion`, keep text contrast at WCAG AA, and work on phones.
- Open decisions: whether to show a live demo on the landing page without sign-in. (The visual direction is decided: see `DESIGN.md`.)

## Brand Commitments
Keep the name "Nebula". The current logo (a sparkle icon on a teal gradient tile) is a stock icon and may be replaced.

## Evidence on Hand
Source is public. No customer, usage or performance claims exist, so none may appear on the page. Numbers shown in any demo must be labelled as sample data.

# Features built

How it is put together: [[architecture]].

- **Landing page** (`/`): "Glass Lanterns" look. A floating Liquid Glass nav (real refraction), the heading "See every agent working.", and sample agents as glass tiles: lit from inside when working, a dashed outline when idle, with a red seal on the last to answer (labelled sample data). The tiles rise and light in turn, then one flares as its numbers count up and the seal glides to it. Then a short "what it does" list and the stack. Replaced the old "AI Automation Agency" copy.
- **Auth**: sign up, email OTP verification (with resend), sign in, forgot and reset password. Change password and profile are behind a login.
- **Agents** (`/app/agents`): create, edit, delete, favourite; system prompt, provider and model (OpenAI GPT-5 family, GPT-4.1, Gemini 3.0 Pro and Flash as listed in `agent-edit-dialog.tsx`), temperature and max tokens.
- **Chat** (`/app/chat`): pick an agent, streaming replies (SSE), saved conversations that can be renamed and deleted.
- **Analytics** (`/app/analytics`): metric cards (large tabular numbers), time ranges, per-agent filter, line, area and bar charts, live updates over the `/metrics` socket with pause and play.
- **Profile** (`/app/profile`): account details, password change and an **API keys** card where each user saves, replaces or removes their own OpenAI and Gemini keys (shown only by last four characters). Chat uses the user's key, falls back to a shared server key if one is configured, and otherwise tells the user to add one (with an Open Profile action).
- **Shell**: collapsible sidebar with a red seal and highlight that glide between routes, glass chrome, top bar, mobile drawer. Pages fade and rise on route change; metric numbers count up; agent cards and chat messages enter with a short rise.

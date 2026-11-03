# Features built

How it is put together: [[architecture]].

- **Landing page** (`/`): "The Departure Board" look. A board of sample agents (labelled sample data) whose rows change every few seconds, a short "what it does" list and the stack. Replaced the old "AI Automation Agency" copy.
- **Auth**: sign up, email OTP verification (with resend), sign in, forgot and reset password. Change password and profile are behind a login.
- **Agents** (`/app/agents`): create, edit, delete, favourite; system prompt, provider and model (OpenAI GPT-5 family, GPT-4.1, Gemini 3.0 Pro and Flash as listed in `agent-edit-dialog.tsx`), temperature and max tokens.
- **Chat** (`/app/chat`): pick an agent, streaming replies (SSE), saved conversations that can be renamed and deleted.
- **Analytics** (`/app/analytics`): metric cards (flap-cell numbers), time ranges, per-agent filter, line, area and bar charts, live updates over the `/metrics` socket with pause and play.
- **Profile** (`/app/profile`): account details and password change.
- **Shell**: collapsible sidebar with an amber marker on the current route, top bar, mobile drawer.

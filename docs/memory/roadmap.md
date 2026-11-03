# Roadmap

Open or unverified items only. What exists is in [[features-built]].

- **Click through the redesigned app screens** (agents, chat, analytics, profile) with the backend running; only the landing, auth and shell were seen.
- **Test sign-up end to end** with real SMTP, then chat with a real AI key and watch live analytics.
- **Fix the startup check** that demands both AI keys even when only one is used ([[gotchas]]).
- **Untrack `backend/logs/*.log`** and ignore them.
- **Add an ESLint config** (none exists).
- **Draw a real logo.** The N on a flap card is a placeholder.
- **Confirm the positioning line** in `frontend/PRODUCT.md`; it was inferred from the README.
- **Refresh the code map** with `python -m graphify update .` after larger changes.

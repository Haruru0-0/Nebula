# Roadmap

Open or unverified items only. What exists is in [[features-built]].

- **Look at the agents, chat, analytics and profile screens in the glass look** with the backend running (only the landing, sign-in and a shell test page were seen); dense screens may need `Panel` surfaces checked for contrast.
- **Click through the redesigned app screens** (agents, chat, analytics, profile) with the backend running; only the landing, auth and shell were seen.
- **Test sign-up end to end** with real SMTP, then chat with a real AI key and watch live analytics.
- **Fix the startup check** that demands both AI keys even when only one is used ([[gotchas]]).
- **Add an ESLint config** (none exists).
- **Draw a real logo.** The red seal with an N is a placeholder.
- **Confirm the positioning line** in `frontend/PRODUCT.md`; it was inferred from the README.
- **Refresh the code map** with `python -m graphify update .` after larger changes.

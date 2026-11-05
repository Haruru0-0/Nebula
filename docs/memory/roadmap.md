# Roadmap

Open or unverified items only. What exists is in [[features-built]].

- **Test the new motion:** reduced-motion behaviour, the sidebar glide between real routes, and frame rate with the lens on a weaker machine (the lens is an SVG filter; keep it to a few surfaces).
- **Look at the agents, chat, analytics and profile screens in the glass look** with the backend running (only the landing, sign-in and a shell test page were seen); dense screens may need `Panel` surfaces checked for contrast.
- **Click through the redesigned app screens** (agents, chat, analytics, profile) with the backend running; only the landing, auth and shell were seen.
- **Save a real key end to end:** in Profile, save a real OpenAI or Gemini key, chat with an agent, and check the other user cannot use it. Tests so far used fake keys.
- **Fix `errorHandler`** (add the missing `next` parameter) so unhandled errors are formatted.
- **Test sign-up end to end** with real SMTP, then chat with a real AI key and watch live analytics.
- **Add an ESLint config** (none exists).
- **Draw a real logo.** The red seal with an N is a placeholder.
- **Confirm the positioning line** in `frontend/PRODUCT.md`; it was inferred from the README.
- **Refresh the code map** with `python -m graphify update .` after larger changes.

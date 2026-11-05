# Roadmap

Open or unverified items only. What exists is in [[features-built]].

- **Test the new motion:** reduced-motion behaviour, the sidebar glide between real routes, and frame rate with the lens on a weaker machine (the lens is an SVG filter; keep it to a few surfaces).
- **Check the live model list with a real key:** open Add agent after saving a real OpenAI, Gemini or DeepSeek key and confirm the newest models appear (the filters were only tested on fixture lists).
- **Save a real key end to end:** in Profile, save a real OpenAI, Gemini or DeepSeek key, chat with an agent, and check the other user cannot use it. Tests so far used fake keys.
- **Test sign-up end to end** with real SMTP, then chat with a real AI key and watch live analytics.
- **Add an ESLint config** (none exists).
- **Draw a real logo.** The red seal with an N is a placeholder.
- **Confirm the positioning line** in `frontend/PRODUCT.md`; it was inferred from the README.
- **Refresh the code map** with `python -m graphify update .` after larger changes.
- **Check the themed toasts and the delete dialog** in the browser: the delete dialog should close on confirm, and toasts should match the glass look.
- **Check on a phone-sized screen:** the chat Markdown tables and code blocks, the agent dialog and the empty state were only seen on desktop.
- **Analytics trend lines were removed** (they were hard-coded 12.5% style numbers). Add real period-over-period trends if wanted.
- **Deploy and test the proxy setup on Vercel and Render:** sign in, reload, chat stream, live metrics, session expiry. Check that Vercel's rewrite handles the sign-in cookie and that Render's cold start (free tier sleeps) does not break the first request.
- **Before deploying:** set `JWT_EXPIRES_IN=15m` on Render, create the `refresh_tokens` table in any other database (`yarn db:push`), and check silent refresh and Remember me through the Vercel proxy.
- **Not built:** a list of signed-in devices with a "sign out everywhere" button (the server side, `endAllSessions`, exists).

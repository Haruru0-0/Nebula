import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LiveLanterns } from "@/components/live-lanterns"
import { Mark } from "@/components/mark"
import { Lens } from "@/components/glass-lens"

const WHAT_IT_DOES = [
  {
    title: "Agents",
    body: "Create an agent with a name, a system prompt, a provider and model, and settings like temperature and token limit. Edit or delete it any time.",
  },
  {
    title: "Chat",
    body: "Talk to any agent. Replies stream in as they are written, and every conversation is saved so you can come back to it.",
  },
  {
    title: "Analytics",
    body: "Token use, response latency and conversation counts, updated live over a WebSocket while you work.",
  },
]

const BUILT_WITH = [
  "Next.js 16 and React 19 on the front end",
  "Express and TypeScript on the back end, with PostgreSQL through Drizzle",
  "Socket.io for live metrics and server-sent events for chat",
  "OpenAI, Google Gemini and DeepSeek behind one interface",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground">
      <div className="px-4 pt-4 sm:px-6">
        <header className="mx-auto max-w-6xl">
          <Lens height={60} cornerRadius={999} squish={0.08}>
            <div className="flex h-full w-full items-center justify-between pl-5 pr-3">
              <Link href="/" className="flex items-center gap-3" aria-label="Nebula home">
                <Mark />
                <span className="text-xl font-semibold tracking-tight">Nebula</span>
              </Link>
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </nav>
            </div>
          </Lens>
        </header>
      </div>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            See every agent working.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Nebula is a control center for LLM agents. Set up an agent with a system prompt, a provider and a model,
            chat with it, and watch its tokens and latency as they change.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>

          <div className="mt-16">
            <LiveLanterns />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="what-it-does">
          <h2 id="what-it-does" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What it does
          </h2>
          <dl className="mt-8 grid max-w-4xl gap-x-12 gap-y-8 sm:grid-cols-3">
            {WHAT_IT_DOES.map((item) => (
              <div key={item.title}>
                <dt className="text-xl font-semibold">{item.title}</dt>
                <dd className="mt-2 leading-relaxed text-muted-foreground">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="built-with">
          <h2 id="built-with" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it is built
          </h2>
          <ul className="mt-6 max-w-2xl divide-y divide-border border-y border-border">
            {BUILT_WITH.map((line) => (
              <li key={line} className="py-3 text-muted-foreground">
                {line}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <p className="text-sm text-muted-foreground">
          Built by Ahmad Kanaan.{" "}
          <a className="underline underline-offset-4 hover:text-foreground" href="https://github.com/Haruru0-0/Nebula">
            Source on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

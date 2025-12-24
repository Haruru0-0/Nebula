import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlowBackground } from "@/components/glow-background"
import { GlassCard } from "@/components/glass-card"
import { Sparkles, Search, Workflow, MessageSquare, TrendingUp, Target, Award, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">NEBULA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#process" className="text-sm text-gray-400 hover:text-white transition-colors">
              Process
            </a>
            <a href="#services" className="text-sm text-gray-400 hover:text-white transition-colors">
              Services
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/sign-in">
              <Button variant="ghost" className="text-sm hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 hover:-translate-y-0.5 transition-all">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 border-white/10">
              <div className="flex flex-col gap-6 mt-8">
                <a href="#process" className="text-lg text-gray-400 hover:text-white transition-colors">
                  Process
                </a>
                <a href="#services" className="text-lg text-gray-400 hover:text-white transition-colors">
                  Services
                </a>
                <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
                  <Link href="/auth/sign-in">
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Hero Section */}
      <GlowBackground className="min-h-screen flex items-center justify-center -mt-16" showOrb orbPosition="center">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-balance leading-tight">
              Driving{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                growth
              </span>{" "}
              with AI.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto text-pretty">
              AI Agent Control Center to configure agents, chat with LLMs, and monitor performance metrics in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 hover:-translate-y-0.5 transition-all text-base px-8"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/app/analytics">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/5 text-base px-8 bg-transparent"
                >
                  See Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </GlowBackground>

      {/* Statement Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-balance leading-tight">
              We're a full-service AI Automation Agency 🤝 We turn businesses into AI-driven ✨ industry leaders.
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl">
              We craft workflow automations and bespoke AI solutions for forward-thinking companies.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-32 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Our process</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Subscribe",
                description:
                  "Choose your preferred plan to start and cancel it anytime you like. It's easy to upgrade as your business needs grow.",
                icon: Target,
              },
              {
                number: "02",
                title: "Request",
                description:
                  "Submit your custom automation requests and AI applications your business needs. Your dedicated team will handle the rest.",
                icon: Search,
              },
              {
                number: "03",
                title: "Build",
                description:
                  "Our developers swiftly begin building your custom solutions, prioritizing speed without compromising on quality.",
                icon: Workflow,
              },
              {
                number: "04",
                title: "Test & optimise",
                description:
                  "Rigorous testing and iterative optimisation to make sure every solution is working and perfectly tuned for performance.",
                icon: TrendingUp,
              },
              {
                number: "05",
                title: "Become an industry leader",
                description:
                  "Deploy cutting-edge AI tools that revolutionize how you work, and transform your organization into a worldwide industry leader.",
                icon: Award,
              },
            ].map((step, index) => (
              <GlassCard key={index} className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10">
                    <step.icon className="h-6 w-6 text-teal-400" />
                  </div>
                </div>
                <div className="text-sm text-teal-400 mb-2 font-mono">{step.number}</div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Our services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Workflow automations",
                description:
                  "We automate your workflows by connecting your favourite platforms, tools and apps with efficiency, eliminating manual work.",
                icon: Workflow,
              },
              {
                title: "Chatbot development",
                description:
                  "We develop advanced chatbots that are tailored, understand context, and are trained specifically on your business data.",
                icon: MessageSquare,
              },
              {
                title: "Business consulting",
                description:
                  "Using our expertise, we share ideas with your organization and educate you on how AI-driven automations could enhance your workflow.",
                icon: TrendingUp,
              },
            ].map((service, index) => (
              <GlassCard key={index} className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 mb-6">
                  <service.icon className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">NEBULA</span>
              </div>
              <p className="text-sm text-gray-400">
                Driving growth with AI. Transform your business with cutting-edge automation and AI solutions.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="/app/agents" className="hover:text-white transition-colors">
                      Agents
                    </Link>
                  </li>
                  <li>
                    <Link href="/app/chat" className="hover:text-white transition-colors">
                      Chat
                    </Link>
                  </li>
                  <li>
                    <Link href="/app/analytics" className="hover:text-white transition-colors">
                      Analytics
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#contact" className="hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2025 Nebula. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

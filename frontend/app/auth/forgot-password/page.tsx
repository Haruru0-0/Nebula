import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlowBackground } from "@/components/glow-background"
import { GlassCard } from "@/components/glass-card"
import { Sparkles, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    return (
        <GlowBackground className="min-h-screen" showOrb orbPosition="center">
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">NEBULA</span>
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">Reset password</h1>
                        <p className="text-gray-400">Enter your email and we'll send you reset instructions</p>
                    </div>

                    <GlassCard className="p-10">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="you@example.com" className="bg-white/5 border-white/10" />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 transition-all font-medium h-11"
                            >
                                Send instructions
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link
                                href="/auth/sign-in"
                                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to sign in
                            </Link>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </GlowBackground>
    )
}

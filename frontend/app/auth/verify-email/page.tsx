"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/glass-card"
import { GlowBackground } from "@/components/glow-background"
import { Sparkles, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { verifyEmailUser, clearVerifyEmailState, verifyEmailSelector } from "@/lib/store/slices/auth/verifyEmailSlice"
import { resendVerificationUser, clearResendVerificationState, resendVerificationSelector } from "@/lib/store/slices/auth/resendVerificationSlice"
import { VerifyEmailPayload, ResendVerificationPayload } from "@/types"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const [otp, setOtp] = useState("")
    const [email, setEmail] = useState("")
    const [isVerified, setIsVerified] = useState(false)

    // Redux selectors
    const verifyEmailState = useAppSelector(verifyEmailSelector)
    const resendVerificationState = useAppSelector(resendVerificationSelector)

    useEffect(() => {
        const emailParam = searchParams.get("email")
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams])

    // Handle verify email success
    useEffect(() => {
        if (verifyEmailState.isSuccess && !verifyEmailState.isVerifying) {
            setIsVerified(true)
            toast.success("Email verified successfully!")

            // Clear the verify state
            dispatch(clearVerifyEmailState())

            // Redirect to dashboard after successful verification
            setTimeout(() => {
                router.push("/app/agents")
            }, 2000)
        }
    }, [verifyEmailState.isSuccess, verifyEmailState.isVerifying, dispatch, router])

    // Handle verify email error
    useEffect(() => {
        if (verifyEmailState.isError && verifyEmailState.errorMessage) {
            toast.error(verifyEmailState.errorMessage)
            dispatch(clearVerifyEmailState())
        }
    }, [verifyEmailState.isError, verifyEmailState.errorMessage, dispatch])

    // Handle resend verification success
    useEffect(() => {
        if (resendVerificationState.isSuccess && !resendVerificationState.isResending) {
            toast.success("Verification email sent successfully!")
            dispatch(clearResendVerificationState())
        }
    }, [resendVerificationState.isSuccess, resendVerificationState.isResending, dispatch])

    // Handle resend verification error
    useEffect(() => {
        if (resendVerificationState.isError && resendVerificationState.errorMessage) {
            toast.error(resendVerificationState.errorMessage)
            dispatch(clearResendVerificationState())
        }
    }, [resendVerificationState.isError, resendVerificationState.errorMessage, dispatch])

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP code")
            return
        }

        if (!email) {
            toast.error("Email is required")
            return
        }

        const payload: VerifyEmailPayload = {
            token: otp,
            email: email
        }

        dispatch(verifyEmailUser(payload))
    }

    const handleResendOtp = async () => {
        if (!email) {
            toast.error("Email is required")
            return
        }

        const payload: ResendVerificationPayload = {
            email: email
        }

        dispatch(resendVerificationUser(payload))
    }

    const handleOtpChange = (value: string) => {
        // Only allow numbers and limit to 6 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 6)
        setOtp(numericValue)
    }

    if (isVerified) {
        return (
            <GlowBackground>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <GlassCard className="p-10 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                            <p className="text-gray-400 mb-6">
                                Your email has been successfully verified. You will be redirected to the dashboard shortly.
                            </p>
                            <Link href="/app/agents">
                                <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white">
                                    Continue to Dashboard
                                </Button>
                            </Link>
                        </GlassCard>
                    </div>
                </div>
            </GlowBackground>
        )
    }

    return (
        <GlowBackground>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <GlassCard className="p-10">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
                            <p className="text-gray-400">
                                We've sent a verification code to <span className="text-white font-medium">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyEmail} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-sm font-medium">
                                    Verification Code
                                </Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => handleOtpChange(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="text-center text-2xl tracking-widest bg-white/5 border-white/10 focus:ring-teal-500/20"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                />
                                <p className="text-xs text-gray-400 text-center">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={verifyEmailState.isVerifying || otp.length !== 6}
                                className="w-full bg-teal-500 hover:bg-teal-400 text-white"
                            >
                                {verifyEmailState.isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center space-y-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResendOtp}
                                disabled={resendVerificationState.isResending}
                                className="w-full text-gray-400 hover:text-white hover:bg-white/5"
                            >
                                {resendVerificationState.isResending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resending...
                                    </>
                                ) : (
                                    "Resend Code"
                                )}
                            </Button>

                            <div className="text-xs text-gray-500">
                                Code expires in 10 minutes
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <Link
                                href="/auth/sign-up"
                                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign Up
                            </Link>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </GlowBackground>
    )
}
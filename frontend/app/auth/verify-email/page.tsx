"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/panel"
import { Mark } from "@/components/mark"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { verifyEmailUser, clearVerifyEmailState, verifyEmailSelector } from "@/lib/store/slices/auth/verifyEmailSlice"
import { resendVerificationUser, clearResendVerificationState, resendVerificationSelector } from "@/lib/store/slices/auth/resendVerificationSlice"
import { VerifyEmailPayload, ResendVerificationPayload } from "@/types"

function VerifyEmailForm() {
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
            <div className="w-full max-w-md">
                <Panel className="p-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <CheckCircle2 className="h-8 w-8 text-foreground" />
                        </div>
                    </div>
                    <h1 className="font-flap text-3xl font-semibold text-foreground mb-2">Email Verified!</h1>
                    <p className="text-muted-foreground mb-6">
                        Your email has been successfully verified. You will be redirected to the dashboard shortly.
                    </p>
                    <Link href="/app/agents">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Continue to Dashboard
                        </Button>
                    </Link>
                </Panel>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md">
            <Panel className="p-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Mark className="h-14 w-14" />
                    </div>
                    <h1 className="font-flap text-3xl font-semibold text-foreground mb-2">Verify Your Email</h1>
                    <p className="text-muted-foreground">
                        We've sent a verification code to <span className="text-foreground font-medium">{email}</span>
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
                            className="text-center text-2xl tracking-widest bg-muted border-border"
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                            Enter the 6-digit code sent to your email
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={verifyEmailState.isVerifying || otp.length !== 6}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
                        className="w-full text-muted-foreground hover:text-foreground hover:bg-accent"
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

                    <div className="text-xs text-muted-foreground">
                        Code expires in 10 minutes
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <Link
                        href="/auth/sign-up"
                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign Up
                    </Link>
                </div>
            </Panel>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="min-h-screen flex items-center justify-center p-4">
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-foreground" />}>
                    <VerifyEmailForm />
                </Suspense>
            </div>
        </div>
    )
}

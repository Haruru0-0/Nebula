"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { forgotPassword, passwordSelector, clearPasswordState } from "@/lib/store/slices/auth/passwordSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { GlowBackground } from "@/components/glow-background"
import { GlassCard } from "@/components/glass-card"
import { Sparkles, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const dispatch = useAppDispatch()
    const { isFetching, isError, errorMessage, isSuccess } = useAppSelector(passwordSelector)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    useEffect(() => {
        return () => {
            dispatch(clearPasswordState())
        }
    }, [dispatch])

    useEffect(() => {
        if (isSuccess) {
            setIsSubmitted(true)
        }
    }, [isSuccess])

    useEffect(() => {
        if (isError && errorMessage) {
            toast.error(errorMessage)
        }
    }, [isError, errorMessage])

    function onSubmit(values: z.infer<typeof formSchema>) {
        dispatch(forgotPassword(values.email))
    }

    if (isSubmitted) {
        return (
            <GlowBackground className="min-h-screen" showOrb orbPosition="center">
                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="w-full max-w-md">
                        <GlassCard className="p-10 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 bg-teal-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-10 w-10 text-teal-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                            <p className="text-gray-400 mb-8">
                                We've sent a password reset link to <span className="text-white font-medium">{form.getValues("email")}</span>
                            </p>
                            <Link href="/auth/sign-in">
                                <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 transition-all font-medium h-11">
                                    Return to sign in
                                </Button>
                            </Link>
                        </GlassCard>
                    </div>
                </div>
            </GlowBackground>
        )
    }

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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="you@example.com"
                                                    className="bg-white/5 border-white/10"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isFetching}
                                    className="w-full bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 transition-all font-medium h-11"
                                >
                                    {isFetching ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send instructions"
                                    )}
                                </Button>
                            </form>
                        </Form>

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

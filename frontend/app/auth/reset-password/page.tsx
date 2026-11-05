"use client"

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { resetPassword, passwordSelector, clearPasswordState } from "@/lib/store/slices/auth/passwordSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Mark } from "@/components/mark"
import { GlassPanel } from "@/components/panel"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const dispatch = useAppDispatch()
    const { isFetching, isError, errorMessage, isSuccess } = useAppSelector(passwordSelector)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        return () => {
            dispatch(clearPasswordState())
        }
    }, [dispatch])

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                router.push("/auth/sign-in")
            }, 3000)
        }
    }, [isSuccess, router])

    useEffect(() => {
        if (isError && errorMessage) {
            toast.error(errorMessage)
        }
    }, [isError, errorMessage])

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!token) return
        dispatch(resetPassword({ token, password: values.password }))
    }

    if (!token) {
        return (
            <GlassPanel className="p-10 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Invalid session</h2>
                <p className="text-muted-foreground mb-8">
                    The reset token is missing or has expired. Please request a new one.
                </p>
                <Link href="/auth/forgot-password">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-medium h-11">
                        Go to Forgot Password
                    </Button>
                </Link>
            </GlassPanel>
        )
    }

    if (isSuccess) {
        return (
            <GlassPanel className="p-10 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-foreground" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Password reset!</h2>
                <p className="text-muted-foreground mb-8">
                    Your password has been successfully updated. Redirecting you to sign in...
                </p>
                <Link href="/auth/sign-in">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-medium h-11">
                        Sign in now
                    </Button>
                </Link>
            </GlassPanel>
        )
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <Mark className="h-10 w-10" />
              <span className="text-3xl font-semibold">Nebula</span>
                </Link>
                <h1 className="text-4xl font-semibold mb-2">Set new password</h1>
                <p className="text-muted-foreground">Please enter your new password below</p>
            </div>

            <GlassPanel className="p-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-muted border-border"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-muted border-border"
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
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-medium h-11"
                        >
                            {isFetching ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Reset password"
                            )}
                        </Button>
                    </form>
                </Form>
            </GlassPanel>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen">
            <div className="min-h-screen flex items-center justify-center p-6">
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-foreground" />}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}

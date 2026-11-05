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
import { Mark } from "@/components/mark"
import { GlassPanel } from "@/components/panel"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
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
            <div className="min-h-screen">
                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="w-full max-w-md">
                        <GlassPanel className="p-10 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-10 w-10 text-foreground" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                            <p className="text-muted-foreground mb-8">
                                We've sent a password reset link to <span className="text-foreground font-medium">{form.getValues("email")}</span>
                            </p>
                            <Link href="/auth/sign-in">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-medium h-11">
                                    Return to sign in
                                </Button>
                            </Link>
                        </GlassPanel>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6">
                            <Mark className="h-10 w-10" />
              <span className="text-3xl font-semibold">Nebula</span>
                        </Link>
                        <h1 className="text-4xl font-semibold mb-2">Reset password</h1>
                        <p className="text-muted-foreground">Enter your email and we'll send you reset instructions</p>
                    </div>

                    <GlassPanel className="p-10">
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
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to sign in
                            </Link>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    )
}

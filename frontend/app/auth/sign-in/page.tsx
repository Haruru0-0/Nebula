"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { loginUser, loginSelector, clearLoginState } from "@/lib/store/slices/auth/loginSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Mark } from "@/components/mark"
import { Panel } from "@/components/panel"
import { Loader2 } from "lucide-react"
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
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export default function SignInPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { isFetching, isSuccess, isError, errorMessage } = useAppSelector(loginSelector)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    return () => {
      dispatch(clearLoginState())
    }
  }, [dispatch])

  useEffect(() => {
    if (isSuccess) {
      toast.success("Welcome back!")
      router.push("/app/chat")
    }
  }, [isSuccess, router])

  useEffect(() => {
    if (isError && errorMessage) {
      if (errorMessage.includes('verify your email') || errorMessage.includes('Email verification') || errorMessage.includes('verify')) {
        toast.error(
          <div>
            <div>{errorMessage}</div>
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(form.getValues("email"))}`}
              className="text-foreground underline underline-offset-4 underline"
            >
              Resend verification email
            </Link>
          </div>,
          { duration: 6000 }
        )
      } else {
        toast.error(errorMessage)
      }
    }
  }, [isError, errorMessage, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch(loginUser(values))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Mark className="h-10 w-10" />
              <span className="font-flap text-3xl font-semibold">Nebula</span>
            </Link>
            <h1 className="font-flap text-4xl font-semibold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <Panel className="p-10">
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
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
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <Link href="/auth/sign-up" className="text-foreground underline underline-offset-4 transition-colors font-medium">
                Create new account
              </Link>
              <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground/80 transition-colors">
                Forgot password?
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

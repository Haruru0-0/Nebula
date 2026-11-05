import type React from "react"
import type { Metadata } from "next"
import { Onest } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { Backdrop } from "@/components/backdrop"
import { Toaster } from "sonner"

const body = Onest({ subsets: ["latin"], variable: "--font-body", display: "swap" })

export const metadata: Metadata = {
  title: "Nebula - AI Agent Control Center",
  description: "Configure agents, chat with LLMs, and monitor performance metrics in real time.",
  icons: {
    icon: [
      {
        url: "/icon.png",
      },
    ],
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${body.variable} dark`}>
      <body className="font-sans antialiased relative isolate">
        <Backdrop />
        <ReduxProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              unstyled: false,
              classNames: {
                toast:
                  "!rounded-xl !border !border-[color:var(--glass-edge)] !bg-[color:var(--popover)] !text-[color:var(--popover-foreground)] !shadow-[0_12px_40px_rgba(0,0,0,0.45)] !font-sans",
                title: "!font-medium",
                description: "!text-[color:var(--muted-foreground)]",
                success: "[&_[data-icon]]:!text-[color:var(--primary)]",
                error: "!border-[color:var(--error-text)]/40 [&_[data-icon]]:!text-[color:var(--error-text)]",
                actionButton: "!bg-[color:var(--primary)] !text-[color:var(--primary-foreground)]",
                cancelButton: "!bg-transparent !text-[color:var(--muted-foreground)]",
              },
            }}
          />
          <Analytics />
        </ReduxProvider>
      </body>
    </html>
  )
}

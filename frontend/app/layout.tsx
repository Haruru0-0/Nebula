import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/redux-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

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

import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ReduxProvider>
          {children}
          <Toaster position="top-right" richColors />
          <Analytics />
        </ReduxProvider>
      </body>
    </html>
  )
}

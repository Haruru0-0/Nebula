import type React from "react"
import type { Metadata } from "next"
import { Barlow_Semi_Condensed, Public_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { Toaster } from "sonner"

const flapFace = Barlow_Semi_Condensed({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-flap-face",
  display: "swap",
})
const body = Public_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" })

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
    <html lang="en" className={`${flapFace.variable} ${body.variable} dark`}>
      <body className="font-sans antialiased">
        <ReduxProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
          <Analytics />
        </ReduxProvider>
      </body>
    </html>
  )
}

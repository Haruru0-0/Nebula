"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  const getTitleFromPath = () => {
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Dashboard"
  }

  return (
    <div className="flex h-screen">
      <aside className="hidden lg:block h-full">
        <AppSidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopbar title={getTitleFromPath()} />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              className="min-h-full"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster />
    </div>
  )
}

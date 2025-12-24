"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const getTitleFromPath = () => {
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Dashboard"
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* <CHANGE> Sidebar always visible on desktop, responsive width */}
      <aside className="hidden lg:block h-full">
        <AppSidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopbar title={getTitleFromPath()} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <Toaster />
    </div>
  )
}

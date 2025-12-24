"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"

interface AppTopbarProps {
  title: string
}

export function AppTopbar({ title }: AppTopbarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-black/95 border-white/10">
            <AppSidebar />
          </SheetContent>
        </Sheet>

        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
    </div>
  )
}

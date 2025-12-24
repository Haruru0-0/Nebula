"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  User,
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const routes = [
  {
    label: "Agents",
    icon: Sparkles,
    href: "/app/agents",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/app/chat",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/app/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/app/settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Nebula</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8 flex-shrink-0", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {collapsed && (
        <div className="flex justify-center mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      <Separator className="bg-white/10" />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant="ghost"
              className={cn(
                "w-full gap-3 h-11 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-lg",
                pathname === route.href && "bg-white/10 text-white shadow-sm",
                collapsed ? "justify-center px-0" : "justify-start",
              )}
            >
              <Link href={route.href}>
                <route.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{route.label}</span>}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto p-3 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-3 h-auto p-3 hover:bg-white/5 rounded-lg",
                collapsed ? "justify-center px-2" : "justify-start",
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-teal-500/50 flex-shrink-0">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500">
                  <User className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">Alex Johnson</span>
                  <span className="text-xs text-gray-400 truncate w-full">alex@nebula.ai</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-black/95 border-white/10">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-300">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

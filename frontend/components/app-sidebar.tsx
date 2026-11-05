"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Mark } from "@/components/mark"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { getProfile, profileSelector, logout } from "@/lib/store/slices/auth/profileSlice"
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
  Bot,
  User as UserIcon,
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const routes = [
  {
    label: "Agents",
    icon: Bot,
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
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(profileSelector)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    router.push("/auth/sign-in")
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-border glass-bar transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Mark />
            <span className="text-2xl font-semibold">Nebula</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8 flex-shrink-0 hidden lg:flex", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {collapsed && (
        <div className="flex justify-center mb-4">
          <Mark />
        </div>
      )}

      <Separator className="bg-accent" />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant="ghost"
              className={cn(
                "w-full gap-3 h-11 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md",
                pathname === route.href && "bg-accent text-foreground",
                collapsed ? "justify-center px-0" : "justify-start",
              )}
            >
              <Link href={route.href} aria-current={pathname === route.href ? "page" : undefined}>
                <span
                  aria-hidden
                  className={cn("h-2 w-2 flex-shrink-0 rounded-[1px]", pathname === route.href ? "bg-marker" : "bg-transparent")}
                />
                <route.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{route.label}</span>}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-3 h-auto p-3 hover:bg-accent rounded-lg",
                collapsed ? "justify-center px-2" : "justify-start",
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback className="bg-secondary text-foreground font-semibold text-xs ">
                  {user?.name
                    ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{user?.email || ""}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-accent" />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/app/profile')}>
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-accent" />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [compactSidebar, setCompactSidebar] = useState(false)
  const { toast } = useToast()

  const handleResetState = () => {
    toast({
      title: "State Reset",
      description: "UI state has been reset to defaults.",
    })
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and settings.</p>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme (currently fixed to dark)</p>
              </div>
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} disabled />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-muted-foreground">Show smooth transitions and effects</p>
              </div>
              <Switch id="animations" checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact">Compact Sidebar</Label>
                <p className="text-sm text-muted-foreground">Use a more compact sidebar layout (UI only)</p>
              </div>
              <Switch id="compact" checked={compactSidebar} onCheckedChange={setCompactSidebar} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <div>
              <Label>Reset Application State</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Clear all in-memory state and reset to defaults. This will not affect any backend data.
              </p>
              <Button onClick={handleResetState} variant="destructive">
                Reset UI State
              </Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20">
          <h3 className="font-semibold mb-2">Frontend Prototype Notice</h3>
          <p className="text-sm text-muted-foreground">
            This is a UI prototype with in-memory state management. All data is stored locally in your browser session
            and will be lost on refresh. Backend integration is required for production use.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}

"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Agent } from "@/types"

interface AgentDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onConfirm: () => void
  isLoading?: boolean
}

export function AgentDeleteDialog({ open, onOpenChange, agent, onConfirm, isLoading }: AgentDeleteDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleConfirm = () => {
    onConfirm()
    // We don't close the dialog immediately if it's loading, 
    // the parent will handle closing it when isSuccess is true.
    // However, the current AgentsPage logic sets agentToDelete to null, which might close it.
    // For now I'll stick to the current flow but disable the button.
  }

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-black/95 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold text-white">{agent?.name}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10" disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirm} className="bg-red-500 hover:bg-red-400 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black/95 border-white/10">
        <DrawerHeader>
          <DrawerTitle>Are you sure?</DrawerTitle>
          <DrawerDescription>
            This will permanently delete <span className="font-semibold text-white">{agent?.name}</span>. This action
            cannot be undone.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button onClick={handleConfirm} className="bg-red-500 hover:bg-red-400 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

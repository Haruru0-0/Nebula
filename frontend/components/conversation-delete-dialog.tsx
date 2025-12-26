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

interface ConversationDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    conversationTitle: string
    onConfirm: () => void
    isLoading?: boolean
}

export function ConversationDeleteDialog({
    open,
    onOpenChange,
    conversationTitle,
    onConfirm,
    isLoading
}: ConversationDeleteDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const handleConfirm = () => {
        onConfirm()
    }

    if (isDesktop) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent className="bg-black/95 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the conversation <span className="font-semibold text-white">"{conversationTitle}"</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10" disabled={isLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={handleConfirm}
                            className="bg-red-500 hover:bg-red-400 text-white"
                            disabled={isLoading}
                        >
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
                        This will permanently delete the conversation <span className="font-semibold text-white">"{conversationTitle}"</span>.
                        This action cannot be undone.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    <Button
                        onClick={handleConfirm}
                        className="bg-red-500 hover:bg-red-400 text-white"
                        disabled={isLoading}
                    >
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
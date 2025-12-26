"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { getProfile, changePassword, profileSelector } from "@/lib/store/slices/auth/profileSlice"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, User, Mail, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
    const dispatch = useAppDispatch()
    const { user, isFetching, isChangingPassword, changePasswordError } = useAppSelector(profileSelector)

    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [showPasswordForm, setShowPasswordForm] = useState(false)

    useEffect(() => {
        dispatch(getProfile())
    }, [dispatch])

    useEffect(() => {
        if (changePasswordError) {
            toast.error(changePasswordError)
        }
    }, [changePasswordError])

    const handlePasswordChange = async () => {
        if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error("Please fill in all password fields")
            return
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match")
            return
        }

        if (passwords.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long")
            return
        }

        if (passwords.oldPassword === passwords.newPassword) {
            toast.error("New password must be different from current password")
            return
        }

        try {
            await dispatch(changePassword({
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            })).unwrap()

            toast.success("Password changed successfully")
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
            setShowPasswordForm(false)
        } catch (error) {
            // Error is handled by the slice
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setPasswords(prev => ({ ...prev, [field]: value }))
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and change your password.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Information */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="h-5 w-5 text-teal-400" />
                        <h2 className="text-xl font-semibold">Profile Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Name
                                </Label>
                                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{user?.name || "Not set"}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </Label>
                                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Member Since
                            </Label>
                            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                                </span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Change Password */}
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-teal-400" />
                            <h2 className="text-xl font-semibold">Change Password</h2>
                        </div>
                        {!showPasswordForm && (
                            <Button
                                onClick={() => setShowPasswordForm(true)}
                                className="bg-teal-500 hover:bg-teal-400 text-white"
                            >
                                Change Password
                            </Button>
                        )}
                    </div>

                    {showPasswordForm ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword" className="text-sm font-medium">
                                    Current Password
                                </Label>
                                <Input
                                    id="oldPassword"
                                    type="password"
                                    value={passwords.oldPassword}
                                    onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                                    placeholder="Enter your current password"
                                    className="bg-white/5 border-white/10 focus:ring-teal-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-sm font-medium">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                    placeholder="Enter your new password"
                                    className="bg-white/5 border-white/10 focus:ring-teal-500/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    placeholder="Confirm your new password"
                                    className="bg-white/5 border-white/10 focus:ring-teal-500/20"
                                />
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="flex gap-3">
                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={isChangingPassword}
                                    className="bg-teal-500 hover:bg-teal-400 text-white"
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordForm(false)
                                        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
                                    }}
                                    disabled={isChangingPassword}
                                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Click the "Change Password" button above to update your password.
                        </p>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}
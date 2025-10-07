"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TwoFactorSetupDialog } from "@/components/two-factor-setup-dialog"
import { TwoFactorDisableDialog } from "@/components/two-factor-disable-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

function SettingsContent() {
  const { user } = useAuth()
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false)

  const handleSuccess = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background">
          <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
            <Link href="/vault" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SecureVault</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto max-w-3xl px-4 py-8">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href="/vault">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Vault
                </Link>
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account security settings</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account with time-based one-time passwords (TOTP)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        {twoFactorEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        twoFactorEnabled
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>

                  {twoFactorEnabled ? (
                    <Button variant="destructive" onClick={() => setDisableDialogOpen(true)}>
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button onClick={() => setSetupDialogOpen(true)}>Enable 2FA</Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm">{user?.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <TwoFactorSetupDialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen} onSuccess={handleSuccess} />

      <TwoFactorDisableDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen} onSuccess={handleSuccess} />
    </>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

interface UnlockVaultDialogProps {
  open: boolean
  onUnlock: (password: string) => Promise<boolean>
  error?: string | null
}

export function UnlockVaultDialog({ open, onUnlock, error }: UnlockVaultDialogProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onUnlock(password)
    setIsLoading(false)
    setPassword("")
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Unlock Your Vault</DialogTitle>
          <DialogDescription className="text-center">
            Enter your master password to access your encrypted vault
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="master-password">Master Password</Label>
            <Input
              id="master-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={!password || isLoading}>
              {isLoading ? "Unlocking..." : "Unlock Vault"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

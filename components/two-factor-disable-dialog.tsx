"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { ShieldOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TwoFactorDisableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TwoFactorDisableDialog({ open, onOpenChange, onSuccess }: TwoFactorDisableDialogProps) {
  const { disable2FA } = useAuth()
  const [totpCode, setTotpCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const handleDisable = async () => {
    if (totpCode.length !== 6) return

    setIsVerifying(true)
    const success = await disable2FA(totpCode)
    setIsVerifying(false)

    if (success) {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      })
      onSuccess()
      onOpenChange(false)
      setTotpCode("")
    } else {
      toast({
        title: "Invalid Code",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5" />
            Disable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>Enter your 6-digit code to disable 2FA</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totp-code">Enter the 6-digit code from your app:</Label>
            <Input
              id="totp-code"
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDisable}
              disabled={totpCode.length !== 6 || isVerifying}
              variant="destructive"
              className="flex-1"
            >
              {isVerifying ? "Verifying..." : "Disable 2FA"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

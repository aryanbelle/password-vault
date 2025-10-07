"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { generateSecret, generateQRCodeURL } from "@/lib/totp"
import { Shield, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TwoFactorSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TwoFactorSetupDialog({ open, onOpenChange, onSuccess }: TwoFactorSetupDialogProps) {
  const { user, enable2FA } = useAuth()
  const [secret] = useState(() => generateSecret())
  const [totpCode, setTotpCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const qrCodeURL = user ? generateQRCodeURL(secret, user.email) : ""

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "Secret key copied to clipboard",
    })
  }

  const handleVerify = async () => {
    if (totpCode.length !== 6) return

    setIsVerifying(true)
    const success = await enable2FA(secret, totpCode)
    setIsVerifying(false)

    if (success) {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully",
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
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>Scan the QR code with your authenticator app to set up 2FA</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {qrCodeURL && (
              <div className="rounded-lg border p-4 bg-white">
                <img src={qrCodeURL || "/placeholder.svg"} alt="QR Code" className="h-48 w-48" />
              </div>
            )}

            <div className="w-full space-y-2">
              <Label>Or enter this key manually:</Label>
              <div className="flex gap-2">
                <Input value={secret} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

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
            <Button onClick={handleVerify} disabled={totpCode.length !== 6 || isVerifying} className="flex-1">
              {isVerifying ? "Verifying..." : "Verify & Enable"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

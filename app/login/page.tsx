"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password, totpCode || undefined)

    if (result.success) {
      router.push("/vault")
    } else if (result.requires2FA) {
      setRequires2FA(true)
      setError("")
    } else {
      setError(requires2FA ? "Invalid verification code" : "Invalid email or password")
    }

    setIsLoading(false)
  }

  const handleBack = () => {
    setRequires2FA(false)
    setTotpCode("")
    setError("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {requires2FA ? "Two-Factor Authentication" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {requires2FA
              ? "Enter the 6-digit code from your authenticator app"
              : "Enter your credentials to access your vault"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!requires2FA ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                  autoFocus
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              {requires2FA && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 bg-transparent"
                >
                  Back
                </Button>
              )}
              <Button type="submit" className={requires2FA ? "flex-1" : "w-full"} disabled={isLoading}>
                {isLoading ? "Verifying..." : requires2FA ? "Verify" : "Sign in"}
              </Button>
            </div>
          </form>
          {!requires2FA && (
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

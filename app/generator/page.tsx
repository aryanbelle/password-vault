"use client"

import { PasswordGenerator } from "@/components/password-generator"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"

export default function GeneratorPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SecureVault</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/vault">My Vault</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/generator">Generator</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <PasswordGenerator />
        </div>
      </main>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Key, Lock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SecureVault</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/generator">Try Generator</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight">
              Your passwords, secured and encrypted
            </h1>
            <p className="mb-8 text-pretty text-xl text-muted-foreground">
              Generate strong passwords and store them safely with client-side encryption. Your data never leaves your
              device unencrypted.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Start for free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Key className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Strong Passwords</h3>
                <p className="text-sm text-muted-foreground">
                  Generate cryptographically secure passwords with customizable options
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Client-Side Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Your vault is encrypted before it ever leaves your browser
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Privacy First</h3>
                <p className="text-sm text-muted-foreground">No plaintext passwords stored anywhere, ever</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          SecureVault - Built with privacy in mind
        </div>
      </footer>
    </div>
  )
}

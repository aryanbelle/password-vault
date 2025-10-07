"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Copy, RefreshCw, Check } from "lucide-react"
import { generatePassword, calculatePasswordStrength, type PasswordOptions } from "@/lib/password-generator"

interface PasswordGeneratorProps {
  onSave?: (password: string) => void
}

export function PasswordGenerator({ onSave }: PasswordGeneratorProps) {
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeLookalikes: false,
  })

  const strength = password ? calculatePasswordStrength(password) : null

  const generate = () => {
    try {
      const newPassword = generatePassword(options)
      setPassword(newPassword)
      setCopied(false)
    } catch (error) {
      console.error("Password generation error:", error)
    }
  }

  useEffect(() => {
    generate()
  }, [options])

  const copyToClipboard = async () => {
    if (!password) return

    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)

      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("")
        } catch (e) {
          // ignore if browser blocks clearing clipboard
        }
        setCopied(false)
      }, 15000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Create a strong, random password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input value={password} readOnly className="font-mono text-lg" placeholder="Generate a password" />
            <Button size="icon" variant="outline" onClick={copyToClipboard} title="Copy to clipboard">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={generate} title="Generate new password">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {strength && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Strength:</span>
              <span className={strength.color + " font-medium"}>{strength.label}</span>
            </div>
          )}
          {copied && <p className="text-sm text-muted-foreground">Copied! Will clear from clipboard in 15 seconds</p>}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Length: {options.length}</Label>
            </div>
            <Slider
              value={[options.length]}
              onValueChange={([value]) => updateOption("length", value)}
              min={8}
              max={64}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) => updateOption("includeUppercase", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase">Lowercase (a-z)</Label>
              <Switch
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) => updateOption("includeLowercase", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Numbers (0-9)</Label>
              <Switch
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) => updateOption("includeNumbers", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Symbols (!@#$...)</Label>
              <Switch
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) => updateOption("includeSymbols", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lookalikes">Exclude look-alikes (0, O, 1, l, I)</Label>
              <Switch
                id="lookalikes"
                checked={options.excludeLookalikes}
                onCheckedChange={(checked) => updateOption("excludeLookalikes", checked)}
              />
            </div>
          </div>
        </div>

        {onSave && (
          <Button onClick={() => onSave(password)} className="w-full" disabled={!password}>
            Save to Vault
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

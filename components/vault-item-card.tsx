"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Edit, Trash2, Eye, EyeOff, ExternalLink, Check } from "lucide-react"
import type { VaultItem } from "@/lib/vault"

interface VaultItemCardProps {
  item: VaultItem
  onEdit: (item: VaultItem) => void
  onDelete: (id: string) => void
}

export function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)

      // Auto-clear after 15 seconds
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("")
        } catch (e) {
          // ignore if browser blocks clearing clipboard
        }
        setCopiedField(null)
      }, 15000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  {item.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {item.username && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground min-w-20">Username:</span>
              <code className="flex-1 rounded bg-muted px-2 py-1 text-sm font-mono">{item.username}</code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => copyToClipboard(item.username, "username")}
              >
                {copiedField === "username" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground min-w-20">Password:</span>
            <code className="flex-1 rounded bg-muted px-2 py-1 text-sm font-mono">
              {showPassword ? item.password : "••••••••••••"}
            </code>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => copyToClipboard(item.password, "password")}
            >
              {copiedField === "password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {item.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{item.notes}</p>
            </div>
          )}

          {copiedField && (
            <p className="text-xs text-muted-foreground">Copied! Will clear from clipboard in 15 seconds</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

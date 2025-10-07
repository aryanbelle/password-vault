"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { VaultItem } from "@/lib/vault"
import { PasswordGenerator } from "./password-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VaultItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => Promise<void>
  editItem?: VaultItem | null
}

export function VaultItemDialog({ open, onOpenChange, onSave, editItem }: VaultItemDialogProps) {
  const [title, setTitle] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState<string[]>([]) // Added tags state
  const [tagInput, setTagInput] = useState("") // Added tag input state
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title)
      setUsername(editItem.username)
      setPassword(editItem.password)
      setUrl(editItem.url)
      setNotes(editItem.notes)
      setTags(editItem.tags || []) // Load tags from edit item
    } else {
      setTitle("")
      setUsername("")
      setPassword("")
      setUrl("")
      setNotes("")
      setTags([]) // Reset tags
    }
  }, [editItem, open])

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = async () => {
    if (!title || !password) return

    setIsLoading(true)
    try {
      await onSave({ title, username, password, url, notes, tags }) // Include tags in save
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update your vault item details" : "Add a new item to your secure vault"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="generator">Generate Password</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Gmail Account"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input
                id="username"
                placeholder="user@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="generator" className="mt-4">
            <PasswordGenerator onSave={(generatedPassword) => setPassword(generatedPassword)} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !password || isLoading}>
            {isLoading ? "Saving..." : editItem ? "Update" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

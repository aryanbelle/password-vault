"use client"

import { useState, useMemo, useRef } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth"
import { useVault } from "@/hooks/use"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Search, LogOut, Lock, KeyRound, Tag, Download, Upload, Settings } from "lucide-react"
import Link from "next/link"
import { VaultItemCard } from "@/components/vault-item-card"
import { VaultItemDialog } from "@/components/vault-item-dialog"
import { UnlockVaultDialog } from "@/components/unlock-vault-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import type { VaultItem } from "@/lib/vault"
import { exportVault, importVault } from "@/lib/vault"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

function VaultContent() {
  const { user, logout } = useAuth()
  const { items, isUnlocked, unlock, lock, add, update, remove, error, refresh, masterPassword } = useVault()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<VaultItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    items.forEach((item) => {
      item.tags?.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    let filtered = items

    if (selectedTag) {
      filtered = filtered.filter((item) => item.tags?.includes(selectedTag))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.username.toLowerCase().includes(query) ||
          item.url.toLowerCase().includes(query) ||
          item.notes.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [items, searchQuery, selectedTag])

  const handleSave = async (itemData: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => {
    if (editItem) {
      await update(editItem.id, itemData)
      setEditItem(null)
    } else {
      await add(itemData)
    }
  }

  const handleEdit = (item: VaultItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId)
      setDeleteId(null)
    }
  }

  const handleAddNew = () => {
    setEditItem(null)
    setDialogOpen(true)
  }

  const handleExport = async () => {
    try {
      const blob = await exportVault(masterPassword)

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `securevault-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your vault has been exported as an encrypted file",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export vault",
        variant: "destructive",
      })
    }
  }

  const handleImport = async (merge: boolean) => {
    fileInputRef.current?.click()
    fileInputRef.current!.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        await importVault(file, masterPassword, merge)
        await refresh()

        toast({
          title: "Import successful",
          description: merge ? "Items have been merged with your vault" : "Vault has been replaced with imported data",
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import vault - check your file and password",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background">
          <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SecureVault</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/generator">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Generator
                </Link>
              </Button>
              {isUnlocked && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <Download className="mr-2 h-4 w-4" />
                        Backup
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Vault
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleImport(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import & Merge
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleImport(false)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import & Replace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" onClick={lock}>
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Vault
                  </Button>
                </>
              )}
              <Button variant="ghost" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <ThemeToggle />
              <Button variant="ghost" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Vault</h1>
                <p className="text-muted-foreground">
                  {isUnlocked ? `${items.length} items stored securely` : "Unlock to view your items"}
                </p>
              </div>
              {isUnlocked && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              )}
            </div>

            {isUnlocked && (
              <>
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search vault items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {allTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Badge
                        variant={selectedTag === null ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(null)}
                      >
                        All
                      </Badge>
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTag === tag ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {searchQuery || selectedTag ? "No items found" : "Your vault is empty"}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {searchQuery || selectedTag
                        ? "Try a different search term or tag"
                        : "Add your first password to get started"}
                    </p>
                    {!searchQuery && !selectedTag && (
                      <Button onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Item
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => (
                      <VaultItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" />

      <UnlockVaultDialog open={!isUnlocked} onUnlock={unlock} error={error} />

      <VaultItemDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditItem(null)
        }}
        onSave={handleSave}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vault item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function VaultPage() {
  return (
    <ProtectedRoute>
      <VaultContent />
    </ProtectedRoute>
  )
}

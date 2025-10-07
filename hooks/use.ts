"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth"
import {
  loadVaultItems,
  addVaultItem,
  updateVaultItem,
  deleteVaultItem,
  searchVaultItems,
  type VaultItem,
} from "@/lib/vault"

export function useVault() {
  const { user } = useAuth()
  const [items, setItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [masterPassword, setMasterPassword] = useState<string>("")
  const [isUnlocked, setIsUnlocked] = useState(false)

  const unlock = useCallback(
    async (password: string) => {
      if (!user) return false

      try {
        setIsLoading(true)
        setError(null)
        const loadedItems = await loadVaultItems(password)
        setItems(loadedItems)
        setMasterPassword(password)
        setIsUnlocked(true)
        return true
      } catch (err) {
        setError("Failed to unlock vault - incorrect password")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const lock = useCallback(() => {
    setItems([])
    setMasterPassword("")
    setIsUnlocked(false)
  }, [])

  const refresh = useCallback(async () => {
    if (!isUnlocked || !masterPassword) return

    try {
      setIsLoading(true)
      const loadedItems = await loadVaultItems(masterPassword)
      setItems(loadedItems)
    } catch (err) {
      setError("Failed to refresh vault")
    } finally {
      setIsLoading(false)
    }
  }, [isUnlocked, masterPassword])

  const add = useCallback(
    async (item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => {
      if (!isUnlocked || !masterPassword) throw new Error("Vault is locked")

      try {
        const newItem = await addVaultItem(item, masterPassword)
        setItems((prev) => [...prev, newItem])
        return newItem
      } catch (err) {
        setError("Failed to add item")
        throw err
      }
    },
    [isUnlocked, masterPassword],
  )

  const update = useCallback(
    async (id: string, updates: Partial<Omit<VaultItem, "id" | "createdAt">>) => {
      if (!isUnlocked || !masterPassword) throw new Error("Vault is locked")

      try {
        const updatedItem = await updateVaultItem(id, updates, masterPassword)
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
        return updatedItem
      } catch (err) {
        setError("Failed to update item")
        throw err
      }
    },
    [isUnlocked, masterPassword],
  )

  const remove = useCallback(
    async (id: string) => {
      if (!isUnlocked || !masterPassword) throw new Error("Vault is locked")

      try {
        await deleteVaultItem(id, masterPassword)
        setItems((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        setError("Failed to delete item")
        throw err
      }
    },
    [isUnlocked, masterPassword],
  )

  const search = useCallback(
    (query: string) => {
      return searchVaultItems(items, query)
    },
    [items],
  )

  return {
    items,
    isLoading,
    error,
    isUnlocked,
    unlock,
    lock,
    add,
    update,
    remove,
    search,
    refresh,
    masterPassword,
  }
}

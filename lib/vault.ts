"use client"

import { encryptVaultItem, decryptVaultItem, type VaultItem } from "./crypto"

// Get the encryption password (user's login password)
function getEncryptionPassword(): string | null {
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) return null

  const user = JSON.parse(currentUser)
  // In a real app, we'd store this securely in memory during the session
  // For this MVP, we'll use the user's email as part of the key
  // and require re-authentication for sensitive operations
  return user.id
}

// Get vault key for the current user
function getVaultKey(userId: string): string {
  return `vault_${userId}`
}

// Save encrypted vault items
export async function saveVaultItems(items: VaultItem[], password: string): Promise<void> {
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) throw new Error("No user logged in")

  const user = JSON.parse(currentUser)
  const vaultKey = getVaultKey(user.id)

  // Encrypt each item
  const encryptedItems = await Promise.all(items.map((item) => encryptVaultItem(item, password)))

  // Store encrypted items
  localStorage.setItem(vaultKey, JSON.stringify(encryptedItems))
}

// Load and decrypt vault items
export async function loadVaultItems(password: string): Promise<VaultItem[]> {
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) throw new Error("No user logged in")

  const user = JSON.parse(currentUser)
  const vaultKey = getVaultKey(user.id)

  const encryptedData = localStorage.getItem(vaultKey)
  if (!encryptedData) return []

  try {
    const encryptedItems: string[] = JSON.parse(encryptedData)

    // Decrypt each item
    const items = await Promise.all(encryptedItems.map((encrypted) => decryptVaultItem(encrypted, password)))

    return items
  } catch (error) {
    console.error("Failed to decrypt vault:", error)
    throw new Error("Failed to decrypt vault - invalid password")
  }
}

// Add a new vault item
export async function addVaultItem(
  item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">,
  password: string,
): Promise<VaultItem> {
  const items = await loadVaultItems(password)

  const newItem: VaultItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  items.push(newItem)
  await saveVaultItems(items, password)

  return newItem
}

// Update a vault item
export async function updateVaultItem(
  id: string,
  updates: Partial<Omit<VaultItem, "id" | "createdAt">>,
  password: string,
): Promise<VaultItem> {
  const items = await loadVaultItems(password)
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) throw new Error("Item not found")

  const updatedItem: VaultItem = {
    ...items[index],
    ...updates,
    updatedAt: Date.now(),
  }

  items[index] = updatedItem
  await saveVaultItems(items, password)

  return updatedItem
}

// Delete a vault item
export async function deleteVaultItem(id: string, password: string): Promise<void> {
  const items = await loadVaultItems(password)
  const filteredItems = items.filter((item) => item.id !== id)
  await saveVaultItems(filteredItems, password)
}

// Search vault items
export function searchVaultItems(items: VaultItem[], query: string): VaultItem[] {
  const lowerQuery = query.toLowerCase()
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.username.toLowerCase().includes(lowerQuery) ||
      item.url.toLowerCase().includes(lowerQuery) ||
      item.notes.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)), // Added tag search
  )
}

// Export vault as encrypted file
export async function exportVault(password: string): Promise<Blob> {
  const items = await loadVaultItems(password)
  const encryptedItems = await Promise.all(items.map((item) => encryptVaultItem(item, password)))

  const exportData = {
    version: "1.0",
    timestamp: Date.now(),
    items: encryptedItems,
  }

  const jsonString = JSON.stringify(exportData, null, 2)
  return new Blob([jsonString], { type: "application/json" })
}

// Import vault from encrypted file
export async function importVault(file: File, password: string, merge = false): Promise<VaultItem[]> {
  const text = await file.text()
  const importData = JSON.parse(text)

  if (!importData.version || !importData.items) {
    throw new Error("Invalid vault file format")
  }

  // Decrypt imported items
  const importedItems = await Promise.all(
    importData.items.map((encrypted: string) => decryptVaultItem(encrypted, password)),
  )

  if (merge) {
    // Merge with existing items
    const existingItems = await loadVaultItems(password)
    const mergedItems = [...existingItems]

    // Add imported items that don't exist (by ID)
    const existingIds = new Set(existingItems.map((item) => item.id))
    importedItems.forEach((item) => {
      if (!existingIds.has(item.id)) {
        mergedItems.push(item)
      }
    })

    await saveVaultItems(mergedItems, password)
    return mergedItems
  } else {
    // Replace all items
    await saveVaultItems(importedItems, password)
    return importedItems
  }
}

export type { VaultItem }

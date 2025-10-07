// Client-side encryption using Web Crypto API
// We use AES-GCM for encryption and PBKDF2 for key derivation

export interface VaultItem {
  id: string
  title: string
  username: string
  password: string
  url: string
  notes: string
  tags: string[] // Added tags array
  createdAt: number
  updatedAt: number
}

// Derive an encryption key from the user's password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

// Encrypt data using AES-GCM
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)

  const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data))

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length)

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined))
}

// Decrypt data using AES-GCM
export async function decryptData(encryptedString: string, password: string): Promise<string> {
  try {
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedString), (c) => c.charCodeAt(0))

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const encryptedData = combined.slice(28)

    const key = await deriveKey(password, salt)

    const decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData)

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    throw new Error("Decryption failed - invalid password or corrupted data")
  }
}

// Encrypt a vault item
export async function encryptVaultItem(item: VaultItem, password: string): Promise<string> {
  const jsonString = JSON.stringify(item)
  return encryptData(jsonString, password)
}

// Decrypt a vault item
export async function decryptVaultItem(encryptedItem: string, password: string): Promise<VaultItem> {
  const jsonString = await decryptData(encryptedItem, password)
  return JSON.parse(jsonString)
}

"use client"

// TOTP (Time-based One-Time Password) implementation
// Based on RFC 6238

// Base32 encoding/decoding
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32Encode(buffer: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ""

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31]
  }

  return output
}

function base32Decode(base32: string): Uint8Array {
  const cleanedInput = base32.toUpperCase().replace(/=+$/, "")
  const buffer: number[] = []
  let bits = 0
  let value = 0

  for (let i = 0; i < cleanedInput.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanedInput[i])
    if (idx === -1) throw new Error("Invalid base32 character")

    value = (value << 5) | idx
    bits += 5

    if (bits >= 8) {
      buffer.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(buffer)
}

// Generate a random secret
export function generateSecret(): string {
  const buffer = new Uint8Array(20)
  crypto.getRandomValues(buffer)
  return base32Encode(buffer)
}

// Generate TOTP code
async function generateTOTP(secret: string, timeStep = 30, digits = 6): Promise<string> {
  const key = base32Decode(secret)
  const epoch = Math.floor(Date.now() / 1000)
  const time = Math.floor(epoch / timeStep)

  // Convert time to 8-byte buffer
  const timeBuffer = new ArrayBuffer(8)
  const timeView = new DataView(timeBuffer)
  timeView.setUint32(4, time, false)

  // HMAC-SHA1
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"])

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, timeBuffer)
  const signatureArray = new Uint8Array(signature)

  // Dynamic truncation
  const offset = signatureArray[signatureArray.length - 1] & 0x0f
  const binary =
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff)

  const otp = binary % Math.pow(10, digits)
  return otp.toString().padStart(digits, "0")
}

// Verify TOTP code
export async function verifyTOTP(secret: string, token: string, window = 1): Promise<boolean> {
  const timeStep = 30
  const epoch = Math.floor(Date.now() / 1000)
  const currentTime = Math.floor(epoch / timeStep)

  // Check current time and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const time = currentTime + i
    const key = base32Decode(secret)

    // Convert time to 8-byte buffer
    const timeBuffer = new ArrayBuffer(8)
    const timeView = new DataView(timeBuffer)
    timeView.setUint32(4, time, false)

    // HMAC-SHA1
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, timeBuffer)
    const signatureArray = new Uint8Array(signature)

    // Dynamic truncation
    const offset = signatureArray[signatureArray.length - 1] & 0x0f
    const binary =
      ((signatureArray[offset] & 0x7f) << 24) |
      ((signatureArray[offset + 1] & 0xff) << 16) |
      ((signatureArray[offset + 2] & 0xff) << 8) |
      (signatureArray[offset + 3] & 0xff)

    const otp = (binary % Math.pow(10, 6)).toString().padStart(6, "0")

    if (otp === token) {
      return true
    }
  }

  return false
}

// Generate QR code URL for authenticator apps
export function generateQRCodeURL(secret: string, email: string, issuer = "SecureVault"): string {
  const otpauthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthURL)}`
}

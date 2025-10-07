export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeLookalikes: boolean
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

const LOOKALIKES = "0O1lI"

export function generatePassword(options: PasswordOptions): string {
  let charset = ""

  if (options.includeUppercase) charset += UPPERCASE
  if (options.includeLowercase) charset += LOWERCASE
  if (options.includeNumbers) charset += NUMBERS
  if (options.includeSymbols) charset += SYMBOLS

  if (options.excludeLookalikes) {
    charset = charset
      .split("")
      .filter((char) => !LOOKALIKES.includes(char))
      .join("")
  }

  if (charset.length === 0) {
    throw new Error("At least one character type must be selected")
  }

  // Use crypto.getRandomValues for cryptographically secure random generation
  const password = Array.from(crypto.getRandomValues(new Uint32Array(options.length)))
    .map((x) => charset[x % charset.length])
    .join("")

  return password
}

export function calculatePasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  // Length
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) return { score, label: "Weak", color: "text-destructive" }
  if (score <= 4) return { score, label: "Fair", color: "text-orange-500" }
  if (score <= 6) return { score, label: "Good", color: "text-yellow-500" }
  return { score, label: "Strong", color: "text-green-500" }
}

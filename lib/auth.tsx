"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import bcrypt from "bcryptjs"

interface User {
  email: string
  id: string
  twoFactorEnabled?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; requires2FA?: boolean }>
  signup: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  enable2FA: (secret: string, totpCode: string) => Promise<boolean>
  disable2FA: (totpCode: string) => Promise<boolean>
  get2FASecret: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("users")
      const users = usersData ? JSON.parse(usersData) : {}

      // Check if user already exists
      if (users[email]) {
        return false
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const userId = crypto.randomUUID()
      users[email] = {
        id: userId,
        email,
        password: hashedPassword,
        twoFactorEnabled: false,
        twoFactorSecret: null,
      }

      // Save to localStorage
      localStorage.setItem("users", JSON.stringify(users))

      // Set current user
      const newUser = { email, id: userId, twoFactorEnabled: false }
      setUser(newUser)
      localStorage.setItem("currentUser", JSON.stringify(newUser))

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const login = async (
    email: string,
    password: string,
    totpCode?: string,
  ): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("users")
      const users = usersData ? JSON.parse(usersData) : {}

      // Check if user exists
      const userData = users[email]
      if (!userData) {
        return { success: false }
      }

      // Verify password
      const isValid = await bcrypt.compare(password, userData.password)
      if (!isValid) {
        return { success: false }
      }

      // Check if 2FA is enabled
      if (userData.twoFactorEnabled) {
        if (!totpCode) {
          return { success: false, requires2FA: true }
        }

        // Verify TOTP code
        const { verifyTOTP } = await import("./totp")
        const isValidTOTP = await verifyTOTP(userData.twoFactorSecret, totpCode)
        if (!isValidTOTP) {
          return { success: false }
        }
      }

      // Set current user
      const loggedInUser = { email: userData.email, id: userData.id, twoFactorEnabled: userData.twoFactorEnabled }
      setUser(loggedInUser)
      localStorage.setItem("currentUser", JSON.stringify(loggedInUser))

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false }
    }
  }

  const enable2FA = async (secret: string, totpCode: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { verifyTOTP } = await import("./totp")
      const isValid = await verifyTOTP(secret, totpCode)
      if (!isValid) return false

      // Update user data
      const usersData = localStorage.getItem("users")
      const users = usersData ? JSON.parse(usersData) : {}

      if (users[user.email]) {
        users[user.email].twoFactorEnabled = true
        users[user.email].twoFactorSecret = secret
        localStorage.setItem("users", JSON.stringify(users))

        // Update current user
        const updatedUser = { ...user, twoFactorEnabled: true }
        setUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))

        return true
      }

      return false
    } catch (error) {
      console.error("Enable 2FA error:", error)
      return false
    }
  }

  const disable2FA = async (totpCode: string): Promise<boolean> => {
    if (!user) return false

    try {
      const usersData = localStorage.getItem("users")
      const users = usersData ? JSON.parse(usersData) : {}

      if (users[user.email] && users[user.email].twoFactorEnabled) {
        const { verifyTOTP } = await import("./totp")
        const isValid = await verifyTOTP(users[user.email].twoFactorSecret, totpCode)
        if (!isValid) return false

        users[user.email].twoFactorEnabled = false
        users[user.email].twoFactorSecret = null
        localStorage.setItem("users", JSON.stringify(users))

        // Update current user
        const updatedUser = { ...user, twoFactorEnabled: false }
        setUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))

        return true
      }

      return false
    } catch (error) {
      console.error("Disable 2FA error:", error)
      return false
    }
  }

  const get2FASecret = (): string | null => {
    if (!user) return null

    const usersData = localStorage.getItem("users")
    const users = usersData ? JSON.parse(usersData) : {}

    return users[user.email]?.twoFactorSecret || null
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, enable2FA, disable2FA, get2FASecret }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

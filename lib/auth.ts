"use client"

// Simple authentication for demo purposes
// In production, this would integrate with a proper auth service
export const AUTH_CONFIG = {
  adminEmail: "admin@awtad.com",
  adminPassword: "awtad2024",
}

export interface User {
  email: string
  role: "admin"
}

export class AuthService {
  private static readonly STORAGE_KEY = "awtad_auth_token"
  private static readonly USER_KEY = "awtad_user"

  static login(email: string, password: string): Promise<User | null> {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        if (email === AUTH_CONFIG.adminEmail && password === AUTH_CONFIG.adminPassword) {
          const user: User = { email, role: "admin" }
          const token = btoa(JSON.stringify({ user, timestamp: Date.now() }))

          localStorage.setItem(this.STORAGE_KEY, token)
          localStorage.setItem(this.USER_KEY, JSON.stringify(user))

          resolve(user)
        } else {
          resolve(null)
        }
      }, 1000)
    })
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY)
      const token = localStorage.getItem(this.STORAGE_KEY)

      if (!userStr || !token) return null

      // Check if token is expired (24 hours)
      const tokenData = JSON.parse(atob(token))
      const isExpired = Date.now() - tokenData.timestamp > 24 * 60 * 60 * 1000

      if (isExpired) {
        this.logout()
        return null
      }

      const user = JSON.parse(userStr)
      return user
    } catch (error) {
      return null
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

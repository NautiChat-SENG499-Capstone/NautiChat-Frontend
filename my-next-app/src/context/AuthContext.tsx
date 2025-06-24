"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token")
      return !!token
    }
    return false
  })

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("access_token")
      setIsLoggedIn(!!token)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const login = (token: string) => {
    localStorage.setItem("access_token", token)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("is_admin")
    setIsLoggedIn(false)
  }

  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}

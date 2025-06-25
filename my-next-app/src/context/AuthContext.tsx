"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  isGuest: boolean
  login: (token: string, guest?: boolean) => void
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

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("is_guest") === "true"
    }
    return false
  })

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("access_token")
      setIsLoggedIn(!!token)
      setIsGuest(localStorage.getItem("is_guest") === "true")
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const login = (token: string, guest = false) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("is_guest", guest ? "true" : "false")
    setIsLoggedIn(true)
    setIsGuest(guest)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("is_admin")
    localStorage.removeItem("is_guest")
    setIsLoggedIn(false)
    setIsGuest(false)
  }

  return <AuthContext.Provider value={{ isLoggedIn, isGuest, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}

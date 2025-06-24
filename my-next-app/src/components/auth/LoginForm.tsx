"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import PasswordInput from "./PasswordInput"
import { useAuth } from "@/context/AuthContext"

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Login failed")
      }

      const data = await res.json()
      login(data.access_token)

      localStorage.setItem("is_admin", String(data.is_admin))
      router.push("/chat")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    setGuestLoading(true)
    login("guest-access-token")
    localStorage.setItem("is_admin", "false")
    router.push("/chat")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="username"
          placeholder="you@example.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        className="w-full h-12 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700"
        onClick={handleGuestLogin}
        disabled={guestLoading}
      >
        {guestLoading ? "Continuing as Guest..." : "Continue as Guest"}
      </Button>
    </form>
  )
}

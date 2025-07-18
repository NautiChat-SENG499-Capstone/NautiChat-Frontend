"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import PasswordInput from "./PasswordInput"
import { useAuth } from "@/context/AuthContext"

export default function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    oncToken: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.oncToken) {
      setError("ONC Token is required")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
          onc_token: formData.oncToken,
        }),
      })

      const contentType = res.headers.get("content-type")
      let data

      if (contentType?.includes("application/json")) {
        data = await res.json()
        if (!res.ok) {
          throw new Error(data?.detail || "Registration failed")
        }
      } else {
        const text = await res.text()
        throw new Error(text || "Unknown registration error")
      }

      if (data?.access_token) {
        login(data.access_token)
        router.push("/chat")
      } else {
        throw new Error("No access token returned")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
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
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oncToken">ONC Token</Label>
        <Input
          id="oncToken"
          name="oncToken"
          type="text"
          placeholder="Enter your ONC token"
          value={formData.oncToken}
          onChange={handleChange}
          disabled={loading}
          className="h-12"
        />
      </div>

      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}

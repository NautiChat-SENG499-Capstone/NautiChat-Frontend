"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import PasswordInput from "./PasswordInput"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    oncToken: "", // ✅ New field
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match")

    setLoading(true)
    setError(null)

    try {
      // fake API call for now
      setTimeout(async () => {
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          className="h-12"
        />
      </div>

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

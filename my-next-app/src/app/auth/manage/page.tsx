"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ManageAccount() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oncToken: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }

    // Load user data
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      oncToken: localStorage.getItem("onc_token") || "",
    })
  }, [isLoggedIn, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // Save ONC token to localStorage
      localStorage.setItem("onc_token", formData.oncToken)

      // Here you would typically make an API call to update user info
      // await updateUserProfile(formData)

      setMessage("Account updated successfully!")
    } catch (error) {
      setMessage("Failed to update account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!isLoggedIn) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Manage Account</CardTitle>
            <CardDescription>Update your account information and ONC token settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oncToken">ONC Token</Label>
                <Input
                  id="oncToken"
                  name="oncToken"
                  type="password"
                  value={formData.oncToken}
                  onChange={handleInputChange}
                  placeholder="New Ocean Networks Canada API token"
                />
                <p className="text-sm text-gray-600">
                  Your ONC token is used to access Ocean Networks Canada data services.
                </p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded ${
                    message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Updating..." : "Update Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

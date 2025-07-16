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

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        // You might store the ONC token per-user on your backend in the future,
        // but for now, we'll continue using localStorage.
        oncToken: localStorage.getItem("onc_token") || "",
      })
    }
  }, [isLoggedIn, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // 1. Actually call the backend to update user information
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'PATCH', // Use PATCH to update parts of the user profile
        headers: {
          'Content-Type': 'application/json',
          // Assuming your AuthContext provides the token for authorization
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          onc_token: formData.oncToken, // Send the token to be saved on the backend
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update account.");
      }
      
      // 2. Save ONC token to localStorage for immediate use
      localStorage.setItem("onc_token", formData.oncToken)

      setMessage("Account updated successfully!")
    } catch (error: any) {
      setMessage(error.message || "An unexpected error occurred. Please try again.")
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

  // A better loading state while waiting for user data
  if (!user) {
    return <div>Loading account details...</div>
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
              {/* Added Name field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly // Email is the user's identifier, so it should not be editable
                  className="bg-gray-100 cursor-not-allowed"
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
                  placeholder="Enter new ONC API token"
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
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function ManageAccount() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  // State for the ONC Token form
  const [oncToken, setOncToken] = useState("")
  const [isTokenLoading, setIsTokenLoading] = useState(false)
  const [tokenMessage, setTokenMessage] = useState({ type: "", content: "" })

  // State for the Change Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: "", content: "" })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login")
    }
    setOncToken(localStorage.getItem("onc_token") || "")
  }, [isLoggedIn, router])

  // Handler for ONC Token form submission
  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTokenLoading(true)
    setTokenMessage({ type: "", content: "" })

    try {
      // Step 1: Call the backend to validate the token first
      const validationRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-onc-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ onc_token: oncToken }),
      });

      if (!validationRes.ok) {
        const errorData = await validationRes.json();
        throw new Error(errorData.detail || "The provided ONC Token is not valid.");
      }

      // Step 2: If validation is successful, then patch the user profile to save it
      const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ onc_token: oncToken }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json()
        throw new Error(errorData.detail || "Failed to save the new ONC Token.")
      }

      // Step 3: Save to localStorage and show success message
      localStorage.setItem("onc_token", oncToken)
      setTokenMessage({ type: "success", content: "ONC Token validated and updated successfully!" })
    } catch (error: any) {
      setTokenMessage({ type: "error", content: error.message || "An unexpected error occurred." })
    } finally {
      setIsTokenLoading(false)
    }
  }

  // CORRECTED: Handler for Change Password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", content: "New passwords do not match." })
      return
    }

    setIsPasswordLoading(true)
    setPasswordMessage({ type: "", content: "" })

    try {
      // FIX: Changed to PUT and updated the URL to /auth/me/password
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/password`, {
        method: 'PUT', // <-- Correct method
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Failed to change password.")
      }

      setPasswordMessage({ type: "success", content: "Password changed successfully!" })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      setPasswordMessage({ type: "error", content: error.message || "An unexpected error occurred." })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }
  
  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p>Loading account details...</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft size={16} />
          Back
        </Button>

        {/* ONC Token Update Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Update ONC Token</CardTitle>
            <CardDescription>
              Your ONC token is used to access Ocean Networks Canada data services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oncToken">ONC API Token</Label>
                <Input
                  id="oncToken"
                  name="oncToken"
                  type="password"
                  value={oncToken}
                  onChange={(e) => setOncToken(e.target.value)}
                  placeholder="Enter your ONC API token"
                />
              </div>
              {tokenMessage.content && (
                <div
                  className={`p-3 rounded text-sm ${
                    tokenMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {tokenMessage.content}
                </div>
              )}
              <Button type="submit" disabled={isTokenLoading} className="w-full sm:w-auto">
                {isTokenLoading ? "Validating & Saving..." : "Save Token"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              {passwordMessage.content && (
                <div
                  className={`p-3 rounded text-sm ${
                    passwordMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {passwordMessage.content}
                </div>
              )}
              <Button type="submit" disabled={isPasswordLoading} className="w-full sm:w-auto">
                {isPasswordLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
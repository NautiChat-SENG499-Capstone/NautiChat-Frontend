"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function ChatHeader() {
  const { isLoggedIn, isGuest, logout } = useAuth()
  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    // Checks localStorage to see if the user has admin privileges
    const adminFlag = localStorage.getItem("is_admin")
    setIsAdmin(adminFlag === "true")
  }, [])

  const handleLogout = () => {
    logout() // Logs the user out using the AuthContext
    router.push("/auth/login") // Redirects to the login page
  }

  return (
    <div className="bg-sky-950 text-white p-6">
      <div className="flex items-center justify-between mb-4">
        {/* Left Side: ONC Logo */}
        <div className="flex items-center space-x-4">
          <a
            href="https://www.oceannetworks.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 bg-white rounded flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Image src="/ONC_Primary_Pantone.png" alt="Logo" width={100} height={55} />
          </a>
        </div>

        {/* Center: Title and Logos */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h1 className="text-3xl font-bold">Oceans 3.0 Chat Assistant</h1>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Image src="/NautiChatLogo.png" alt="Logo" width={100} height={50} />
            </div>
          </div>
          <p className="text-lg mb-2 opacity-90">
            Ask questions about the data collected from cabled observatories, mobile platforms and autonomous
            instruments.
          </p>
          <p className="text-sm opacity-75">Built with Meta Llama 3</p>
        </div>

        {/* Right Side: Dropdown Menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Conditionally render "Manage Account" for logged-in users */}
              {isLoggedIn && !isGuest && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/manage" className="cursor-pointer">
                      Manage Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {/* Conditionally render "Admin" for admin users */}
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {/* Conditionally render "Sign out" or "Log in" */}
              {isLoggedIn && !isGuest ? (
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="cursor-pointer">
                    Log in
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
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
    const adminFlag = localStorage.getItem("is_admin")
    setIsAdmin(adminFlag === "true")
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <div className="bg-sky-950 text-white px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Logos */}
        <div className="flex items-center space-x-4 justify-center md:justify-start">
          <a
            href="https://www.oceannetworks.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 md:w-16 md:h-16 bg-white rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Image src="/ONC_Primary_Pantone.png" alt="Logo" width={100} height={55} />
          </a>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center">
            <Image src="/NautiChatLogo.png" alt="Logo" width={100} height={50} />
          </div>
        </div>

        {/* Center: Title and description */}
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Oceans 3.0 Chat Assistant</h1>
          <p className="text-sm md:text-lg opacity-90">
            Ask questions about data from observatories, platforms and instruments.
          </p>
          <p className="text-xs md:text-sm opacity-75">Built with Meta Llama 3</p>
        </div>

        {/* Right: Dropdown */}
        <div className="flex justify-center md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isLoggedIn && !isGuest && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/manage">Manage Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isLoggedIn && !isGuest ? (
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Log in/Sign up</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Bot, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ChatHeader() {
  return (
    <div className="bg-cyan-600 text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
            <Image src="/ONC_Primary_Pantone.png" alt="Logo" width={100} height={55} />
        </div>
        
         <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <h1 className="text-3xl font-bold">Oceans 3.0 Chat Assistant</h1>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Image src="/NautiChatLogo.png" alt="Logo" width={100} height={50} />
              </div>
            </div>
            <p className="text-lg mb-2 opacity-90">
              Ask questions about the data collected from cabled observatories, mobile platforms and autonomous instruments.
            </p>
            <p className="text-sm opacity-75">Built with Meta Llama 3</p>
          </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Log in
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

     
    </div>
  )
}

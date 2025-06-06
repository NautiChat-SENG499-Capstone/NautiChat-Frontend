"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp } from "lucide-react"
import { useState } from "react"

interface ChatInputProps {
  placeholder?: string
  onSendMessage?: (message: string) => void
}

export function ChatInput({ placeholder = "Ask anything ...", onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleSendClick = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 pl-6 pr-14 rounded-full border-2 border-gray-300 text-lg focus:border-blue-500 focus:ring-0"
          />
          <Button
            type="button"
            onClick={handleSendClick}
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-full bg-gray-600 hover:bg-gray-700"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

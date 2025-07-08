"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

interface ChatInputProps {
  placeholder?: string
  onSendMessage?: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ placeholder = "Ask anything ...", onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && onSendMessage && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleSendClick = () => {
    if (message.trim() && onSendMessage && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="flex-shrink-0 p-6 border-t bg-white">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none overflow-hidden pl-6 pr-14 py-3 rounded-full border-2 border-gray-300 text-lg focus:border-blue-500 focus:ring-0 disabled:opacity-50"
          />
          <Button
            type="button"
            onClick={handleSendClick}
            disabled={disabled || !message.trim()}
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

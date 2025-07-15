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

  // Auto-growing textarea logic (remains the same)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // 1. A single, clean function to handle the message submission logic
  const submitMessage = () => {
    if (message.trim() && onSendMessage && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  // 2. The new handler for keyboard events in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if 'Enter' was pressed without the 'Shift' key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents adding a new line
      submitMessage();    // Submits the message
    }
  }

  // Wrapper for the form's onSubmit event
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMessage()
  }

  return (
    <div className="flex-shrink-0 p-6 border-t bg-white">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleFormSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown} // 3. The onKeyDown handler is now attached here
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              w-full 
              resize-none 
              pl-6 pr-14 py-3 
              text-lg 
              border-2 border-gray-300 
              focus:border-blue-500 focus:ring-0 
              disabled:opacity-50
              rounded-xl
              max-h-[200px]
              overflow-y-auto
            "
          />
          <Button
            type="button"
            onClick={submitMessage} // Button now calls the same clean function
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
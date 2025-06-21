"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageFeedback } from "./MessageFeedback"
import type { Message } from "@/types/chat"
import { useEffect, useRef } from "react"

interface ChatAreaProps {
  messages?: Message[]
  title?: string
  example?: string
  onFeedback?: (messageId: string, rating: number, comment?: string) => Promise<void>
}

export function ChatArea({
  messages = [],
  title = "What do you want to know?",
  example = "What is the average temperature in Cambridge bay?",
  onFeedback,
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Show welcome screen if no messages
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h2 className="text-4xl font-semibold text-gray-800">{title}</h2>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">Example:</p>
            <p className="text-gray-800">{example}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show chat messages with proper scrolling
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
        <div className="p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-200 text-gray-800 rounded-bl-md"
                    } ${message.content === "Processing..." ? "animate-pulse" : ""}`}
                  >
                    <p className="text-sm leading-relaxed">
                      {message.content}
                      {message.content === "Processing..." && (
                        <span className="inline-block ml-1">
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse animation-delay-200">.</span>
                          <span className="animate-pulse animation-delay-400">.</span>
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Show feedback component for assistant messages (but not processing messages) */}
                {message.role === "assistant" &&
                  message.content !== "Processing..." &&
                  message.id &&
                  onFeedback && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] ml-0">
                        <MessageFeedback
                          messageId={message.id}
                          onFeedback={onFeedback}
                          currentFeedback={message.feedback?.rating}
                        />
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

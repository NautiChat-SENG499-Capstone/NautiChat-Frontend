"use client"

import { ChatHeader } from "@/components/ChatHeader"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatArea } from "@/components/ChatArea"
import { ChatInput } from "@/components/ChatInput"
import type { Message } from "@/types/chat"
import { useState } from "react"

export default function OceansChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const todayChats = [
    "What is the PH in the Straight of Georgia",
    "Do you have any temperature data in Cambridge Bay?",
    
  ]

  const yesterdayChats = [
    "What instruments are on the Cambridge Bay observatory?",
    "What weather sensors are there on the Cambridge Bay observatory?",
  ]

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    }

    // Generate a unique ID for the assistant message
    const assistantMessageId = (Date.now() + 1).toString()

    // Add initial "processing" message from assistant
    const processingMessage: Message = {
      id: assistantMessageId,
      content: "Processing...",
      role: "assistant",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, processingMessage])
    setIsLoading(true)

    // Simulate API call (replace with actual API call)
    setTimeout(() => {
      // Update the processing message with the actual response
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: `Heres the dummy response`,
                timestamp: new Date(), // Update timestamp to when response was received
              }
            : message,
        ),
      )
      setIsLoading(false)
    }, 2500)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar todayChats={todayChats} yesterdayChats={yesterdayChats} />

      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatArea messages={messages} />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={isLoading ? "Waiting for response..." : "Ask anything ..."}
        />
      </div>
    </div>
  )
}

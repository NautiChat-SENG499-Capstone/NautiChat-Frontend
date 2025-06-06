"use client"
import { ChatHeader } from "@/components/chat-header"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatArea } from "@/components/chat-area"
import { ChatInput } from "@/components/chat-input"

export default function OceansChatBot() {
  const todayChats = [
    "What is the PH in the Straight of Georgia",
    "Do you have any temperature data in Cambridge Bay?",
  ]

  const yesterdayChats = [
    "What instruments are on the Cambridge Bay observatory?",
    "What weather sensors are there on the Cambridge Bay observatory?",
  ]

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar todayChats={todayChats} yesterdayChats={yesterdayChats} />

      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatArea />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}

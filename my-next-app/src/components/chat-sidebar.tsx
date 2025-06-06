"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatSidebarProps {
  todayChats?: string[]
  yesterdayChats?: string[]
}

export function ChatSidebar({
  todayChats = [
    "What is the PH in the Straight of Georgia",
    "Do you have any temperature data in Cambridge Bay?",
    "What instruments are on the Cambridge Bay observatory?",
    "What weather sensors are there on the Cambridge Bay observatory?",
  ],
  yesterdayChats = [
    "Python function for Fibonacci sequence",
    "Five largest lakes in the world",
    "Weather forecast in Seattle",
    "Chicken or the egg?",
    "Neural networks for dummies",
  ],
}: ChatSidebarProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-teal-400 to-teal-500 text-white">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 mb-4">
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 opacity-90">Today</h3>
            <div className="space-y-1">
              {todayChats.map((chat, index) => (
                <button
                  key={index}
                  className="w-full text-left text-sm p-2 rounded hover:bg-white/10 transition-colors line-clamp-2"
                >
                  {chat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 opacity-90">Yesterday</h3>
            <div className="space-y-1">
              {yesterdayChats.map((chat, index) => (
                <button
                  key={index}
                  className="w-full text-left text-sm p-2 rounded hover:bg-white/10 transition-colors line-clamp-2"
                >
                  {chat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

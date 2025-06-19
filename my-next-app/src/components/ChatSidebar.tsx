"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2 } from "lucide-react"
import type { Chat } from "@/types/chat"

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId?: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  isLoading?: boolean
}

export function ChatSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isLoading = false,
}: ChatSidebarProps) {
  // Group chats by date
  const groupChatsByDate = (chats: Chat[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const todayChats = chats.filter((chat) => chat.updatedAt >= today)
    const yesterdayChats = chats.filter((chat) => chat.updatedAt >= yesterday && chat.updatedAt < today)
    const olderChats = chats.filter((chat) => chat.updatedAt < yesterday)

    return { todayChats, yesterdayChats, olderChats }
  }

  const { todayChats, yesterdayChats, olderChats } = groupChatsByDate(chats)

  const ChatItem = ({ chat }: { chat: Chat }) => (
    <div key={`chat-item-${chat.id}`} className="group relative">
      <button
        onClick={() => onSelectChat(chat.id)}
        className={`w-full text-left text-sm p-2 rounded transition-colors line-clamp-2 pr-8 ${
          currentChatId === chat.id ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/90"
        }`}
      >
        {chat.title}
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onDeleteChat(chat.id)
        }}
        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/20"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )

  return (
    <div className="w-64 bg-gradient-to-b from-teal-400 to-teal-500 text-white flex flex-col h-full">
      {/* Fixed header section */}
      <div className="p-4 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <Button
          onClick={onNewChat}
          disabled={isLoading}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/20 mb-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Scrollable chat list */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 pb-4">
            {todayChats.length > 0 && (
              <div key="today-section">
                <h3 className="text-sm font-medium mb-2 opacity-90">Today</h3>
                <div className="space-y-1">
                  {todayChats.map((chat) => (
                    <ChatItem key={`today-${chat.id}`} chat={chat} />
                  ))}
                </div>
              </div>
            )}

            {yesterdayChats.length > 0 && (
              <div key="yesterday-section">
                <h3 className="text-sm font-medium mb-2 opacity-90">Yesterday</h3>
                <div className="space-y-1">
                  {yesterdayChats.map((chat) => (
                    <ChatItem key={`yesterday-${chat.id}`} chat={chat} />
                  ))}
                </div>
              </div>
            )}

            {olderChats.length > 0 && (
              <div key="older-section">
                <h3 className="text-sm font-medium mb-2 opacity-90">Older</h3>
                <div className="space-y-1">
                  {olderChats.map((chat) => (
                    <ChatItem key={`older-${chat.id}`} chat={chat} />
                  ))}
                </div>
              </div>
            )}

            {chats.length === 0 && !isLoading && (
              <div className="text-center text-white/70 text-sm py-8">No chats yet. Start a new conversation!</div>
            )}

            {isLoading && <div className="text-center text-white/70 text-sm py-8">Loading chats...</div>}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

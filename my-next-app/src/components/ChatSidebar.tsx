"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { Chat } from "@/types/chat"
import { MiniMap } from "@/components/MiniMap"

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId?: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  isLoading?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ChatSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
}: ChatSidebarProps) {
  const ChatItem = ({ chat }: { chat: Chat }) => (
    <div key={`chat-item-${chat.id}`}>
      <button
        onClick={() => onSelectChat(chat.id)}
        className={`w-full text-left text-sm p-2 rounded transition-colors flex items-center space-x-2 ${
          currentChatId === chat.id
            ? "bg-white/20 text-white"
            : "hover:bg-white/10 text-white/90"
        }`}
      >
        <span className={`${isCollapsed ? "hidden" : "inline"} line-clamp-2`}>
          {chat.title}
        </span>
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile: Hamburger Drawer - NO MAP here, same as before */}
      <div className="md:hidden p-2 bg-cyan-600">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-cyan-600 text-white p-4">
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
            <ScrollArea className="h-[calc(100vh-14rem)] px-1">
              <div className="space-y-1 pb-4">
                {chats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
                {chats.length === 0 && !isLoading && (
                  <div className="text-center text-white/70 text-sm py-8">
                    No chats yet. Start a new conversation!
                  </div>
                )}
                {isLoading && (
                  <div className="text-center text-white/70 text-sm py-8">
                    Loading chats...
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Collapsible Sidebar with fixed map at bottom */}
      <div
        className={`hidden md:flex flex-col h-full min-h-0 bg-cyan-600 text-white transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-3 flex items-center justify-between flex-shrink-0">
          {!isCollapsed && <h2 className="text-xl font-semibold">Chats</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-white hover:bg-white/20"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <Button
            onClick={onNewChat}
            disabled={isLoading}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/20 mb-2 px-4 flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        )}

        {/* Main container to hold scroll + map */}
        <div className="flex-1 flex flex-col min-h-0 px-2">
          {/* Scrollable chat list */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1 pb-4">
              {chats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
              {chats.length === 0 && !isLoading && (
                <div
                  className={`text-center text-white/70 text-sm py-8 ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  No chats yet. Start a new conversation!
                </div>
              )}
              {isLoading && (
                <div
                  className={`text-center text-white/70 text-sm py-8 ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Loading chats...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Static Map at bottom */}
          {!isCollapsed && (
            <div className="mt-4 px-2 flex-shrink-0">
              <h3 className="text-sm font-semibold mb-2">Location</h3>
              <MiniMap />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

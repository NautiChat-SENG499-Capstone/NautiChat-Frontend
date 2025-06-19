"use client"

import { ChatHeader } from "@/components/ChatHeader"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatArea } from "@/components/ChatArea"
import { ChatInput } from "@/components/ChatInput"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import { useChatAPI } from "@/hooks/use-chat-api"
import { useEffect } from "react"

export default function OceansChatBot() {
  const {
    chats,
    currentChat,
    isLoading,
    error,
    connectionStatus,
    createChat,
    loadChat,
    sendMessage,
    deleteChat,
    setCurrentChat,
    initializeApp,
  } = useChatAPI()

  const handleNewChat = () => {
    setCurrentChat(null)
  }

  const handleSelectChat = async (chatId: string) => {
    try {
      await loadChat(chatId)
    } catch (err) {
      console.error("Failed to load chat:", err)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!currentChat) {
      try {
        await createChat(content)
      } catch (err) {
        console.error("Failed to create chat:", err)
      }
    } else {
      try {
        await sendMessage(content, currentChat.id)
      } catch (err) {
        console.error("Failed to send message:", err)
      }
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
    } catch (err) {
      console.error("Failed to delete chat:", err)
    }
  }

  const handleRetryConnection = async () => {
    await initializeApp()
  }

  useEffect(() => {
    if (error) {
      console.error("Chat API Error:", error)
    }
  }, [error])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with proper height constraints */}
      <div className="flex-shrink-0 h-full">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChat?.id}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          isLoading={isLoading}
        />
      </div>

      {/* Main content area with proper flex layout */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Fixed header */}
        <div className="flex-shrink-0">
          <ChatHeader />
        </div>

        {/* Connection status (if needed) */}
        {connectionStatus !== "connected" && (
          <div className="flex-shrink-0">
            <ConnectionStatus
              status={connectionStatus}
              error={error}
              onRetry={handleRetryConnection}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Scrollable chat area */}
        <ChatArea
          messages={currentChat?.messages || []}
          title="What do you want to know?"
          example="What is the average temperature in Cambridge bay?"
        />

        {/* Fixed input at bottom */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || connectionStatus !== "connected"}
          placeholder={
            connectionStatus === "error"
              ? "Connection error..."
              : connectionStatus === "connecting"
                ? "Connecting..."
                : isLoading
                  ? "Processing..."
                  : "Ask anything ..."
          }
        />

        {/* Error message (if needed) */}
        {error && connectionStatus === "connected" && (
          <div className="flex-shrink-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mb-4 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  )
}

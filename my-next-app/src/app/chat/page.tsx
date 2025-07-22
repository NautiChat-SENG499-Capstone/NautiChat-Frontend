"use client";

import { ChatHeader } from "@/components/ChatHeader";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { ChatInput } from "@/components/ChatInput";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { useChatAPI } from "@/hooks/use-chat-api";
import { useEffect, useState } from "react";

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
    submitFeedback,
    setCurrentChat,
    initializeApp,
  } = useChatAPI();

  const handleNewChat = () => setCurrentChat(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

  const handleSelectChat = async (chatId: string) => {
    try {
      await loadChat(chatId);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      if (!currentChat) {
        await createChat(content);
      } else {
        await sendMessage(content, currentChat.id);
      }
    } catch (err) {
      console.error("Message error:", err);
    }
  };

  const handleFeedback = async (messageId: string, rating: number, comment?: string) => {
    try {
      await submitFeedback(messageId, rating, comment);
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const handleRetryConnection = async () => {
    await initializeApp();
  };

  useEffect(() => {
    if (error) console.error("Chat API Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Mobile Top Bar with Sidebar Toggle */} 
      <div className="md:hidden bg-cyan-600 p-2">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChat?.id}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          isLoading={isLoading}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main layout with sidebar and chat content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <ChatSidebar
            chats={chats}
            currentChatId={currentChat?.id}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            isLoading={isLoading}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex-shrink-0">
            <ChatHeader />
          </div>

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

          <ChatArea
            messages={currentChat?.messages || []}
            isLoading={isLoading}
            title="What do you want to know?"
            example="How thick was the ice in Cambridge Bay on February this year?"
            onFeedback={handleFeedback}
          />

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

          {error && connectionStatus === "connected" && (
            <div className="flex-shrink-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mb-4 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

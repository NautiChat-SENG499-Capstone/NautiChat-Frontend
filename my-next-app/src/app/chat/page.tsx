"use client";

import { ChatHeader } from "@/components/ChatHeader"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatArea } from "@/components/ChatArea"
import { ChatInput } from "@/components/ChatInput"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import { DownloadCompletePopup } from "@/components/DownloadCompletePopup"
import { useDownloadManager } from "@/hooks/use-download-manager"
import { useChatAPI } from "@/hooks/use-chat-api"
import { useEffect, useState } from "react"
import type { Message, Chat } from "@/types/chat";

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
  } = useChatAPI()

  const { completedDownloads, dismissCompleted, activeDownloads } = useDownloadManager()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  
  const handleNewChat = () => {
    setCurrentChat(null);
    localStorage.removeItem("currentChatId"); // Clear stored chat ID
  };
  

  const handleSelectChat = async (chatId: string) => {
    try {
      await loadChat(chatId);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChat) {
      // Optimistically create UI elements for a new chat
      const tempUserMessage: Message = {
        id: "temp-user-msg-" + Date.now(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const tempChat: Chat = {
        id: "temp-chat-" + Date.now(),
        title: content.substring(0, 40),
        messages: [tempUserMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCurrentChat(tempChat);

      try {
        await createChat(content);
      } catch (err) {
        console.error("Failed to create chat:", err);
        setCurrentChat(null); // Revert optimistic update on failure
      }
    } else {
      try {
        await sendMessage(content, currentChat.id);
      } catch (err) {
        console.error("Message error:", err);
      }
    }
  };

  const handleFeedback = async (
    messageId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      await submitFeedback(messageId, rating, comment);
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const handleRetryConnection = async () => {
    await initializeApp();
  };

  // 🧠 Restore chat on first load
  useEffect(() => {
    const init = async () => {
      await initializeApp();
      const storedId = localStorage.getItem("currentChatId");
      if (storedId) {
        try {
          await loadChat(storedId);
        } catch (err) {
          console.warn("Failed to load stored chat:", err);
          localStorage.removeItem("currentChatId");
        }
      }
    };
    init();
  }, []);

  //vSave current chat to localStorage when it changes
  useEffect(() => {
    if (currentChat?.id) {
      localStorage.setItem("currentChatId", currentChat.id);
    }
  }, [currentChat?.id]);

  // Log error (optional)
  useEffect(() => {
    if (error) console.error("Chat API Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex-shrink-0 h-full">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="flex-shrink-0">
          <ChatHeader />
        </div>

        {/* Connection Status Indicator */}
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

        {/* Chat Messages Area */}
        <ChatArea
          messages={currentChat?.messages || []}
          isLoading={isLoading}
          title="What do you want to know?"
          example="How thick was the ice in Cambridge Bay in February this year?"
          onFeedback={handleFeedback}
        />

        {/* Chat Input Field */}
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

        {/* Error Display Area */}
        {error && connectionStatus === "connected" && (
          <div className="flex-shrink-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mb-4 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Download complete popups */}
      {completedDownloads.map((requestId) => {
        const downloadJob = activeDownloads[requestId]
        return (
          <DownloadCompletePopup
            key={requestId}
            requestId={requestId}
            onDownload={() => {
              if (downloadJob?.downloadUrl) {
                window.open(downloadJob.downloadUrl, "_blank", "noopener,noreferrer")
              }
              dismissCompleted(requestId)
            }}
            onDismiss={() => dismissCompleted(requestId)}
          />
        )
      })}
    </div>
  );
}
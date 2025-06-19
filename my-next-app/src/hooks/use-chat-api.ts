"use client"

import { useState, useEffect } from "react"
import { chatAPI, convertApiConversation } from "@/lib/api"
import type { Message, Chat } from "@/types/chat"

export function useChatAPI() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")

  // Test connection and load conversations
  const initializeApp = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setConnectionStatus("connecting")

      console.log("Initializing app...")

      // Test connection first
      const isConnected = await chatAPI.testConnection()

      if (isConnected) {
        setConnectionStatus("connected")
        // Load conversations if connection is successful
        await loadChats()
      } else {
        setConnectionStatus("error")
        setError("Unable to connect to the API server. Please check your connection.")
      }
    } catch (err) {
      console.error("App initialization error:", err)
      setConnectionStatus("error")
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize app"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Load all conversations
  const loadChats = async () => {
    try {
      setError(null)

      const apiConversations = await chatAPI.getConversations()
      console.log("Raw API conversations:", apiConversations)

      // Handle case where apiConversations might be undefined or null
      if (!apiConversations) {
        console.warn("API returned null/undefined conversations, using empty array")
        setChats([])
        return
      }

      // Ensure it's an array
      const conversationsArray = Array.isArray(apiConversations) ? apiConversations : []
      const convertedChats = conversationsArray.map(convertApiConversation)
      setChats(convertedChats)
      console.log(`Loaded ${convertedChats.length} conversations`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load conversations"
      setError(errorMessage)
      console.error("Load conversations error:", err)
      // Set empty array on error to prevent undefined issues
      setChats([])
      throw err
    }
  }

  // Create a new conversation and send the first message
  const createChat = async (firstMessage: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Creating new conversation...")

      // Step 1: Create a new conversation
      const conversationTitle = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "")
      const newConversation = await chatAPI.createConversation(conversationTitle)

      // Step 2: Send the first message to get AI response
      const aiResponse = await chatAPI.sendMessage(firstMessage, newConversation.conversation_id)

      // Step 3: Create the chat object with both messages
      const newChat: Chat = {
        id: newConversation.conversation_id,
        title: newConversation.title,
        createdAt: new Date(newConversation.created_at),
        updatedAt: new Date(newConversation.updated_at),
        messages: [
          {
            id: `user-${aiResponse.message_id}`,
            content: aiResponse.input,
            role: "user",
            timestamp: new Date(),
          },
          {
            id: `assistant-${aiResponse.message_id}`,
            content: aiResponse.response,
            role: "assistant",
            timestamp: new Date(),
          },
        ],
      }

      setChats((prev: Chat[]) => [newChat, ...prev])
      setCurrentChat(newChat)
      console.log("New conversation created:", newChat.id)
      return newChat
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create conversation"
      setError(errorMessage)
      console.error("Create conversation error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Load a specific conversation
  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to get the conversation from the API, fallback to local state
      try {
        const apiConversation = await chatAPI.getConversation(chatId)
        const chat = convertApiConversation(apiConversation)
        setCurrentChat(chat)
        return chat
      } catch (apiError) {
        // Fallback to local chat if API doesn't support individual conversation fetching
        const localChat = chats.find((chat) => chat.id === chatId)
        if (localChat) {
          setCurrentChat(localChat)
          return localChat
        }
        throw new Error("Conversation not found")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load conversation"
      setError(errorMessage)
      console.error("Load conversation error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Send a message to existing conversation
  const sendMessage = async (content: string, chatId: string) => {
    if (!currentChat || currentChat.id !== chatId) {
      throw new Error("No active conversation")
    }

    try {
      setError(null)

      // Add user message immediately
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        content,
        role: "user",
        timestamp: new Date(),
      }

      // Add processing message
      const processingMessage: Message = {
        id: `processing-${Date.now()}`,
        content: "Processing...",
        role: "assistant",
        timestamp: new Date(),
      }

      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, userMessage, processingMessage],
            }
          : null,
      )

      // Send to API
      const aiResponse = await chatAPI.sendMessage(content, chatId)

      // Create real messages using the API response format
      const realUserMessage: Message = {
        id: `user-${aiResponse.message_id}`,
        content: aiResponse.input,
        role: "user",
        timestamp: new Date(),
      }

      const assistantMessage: Message = {
        id: `assistant-${aiResponse.message_id}`,
        content: aiResponse.response,
        role: "assistant",
        timestamp: new Date(),
      }

      // Update chat with real messages
      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages.filter((m) => !m.id.startsWith("temp-") && !m.id.startsWith("processing-")),
                realUserMessage,
                assistantMessage,
              ],
            }
          : null,
      )

      // Update chats list
      setChats((prev: Chat[]) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, realUserMessage, assistantMessage], updatedAt: new Date() }
            : chat,
        ),
      )
    } catch (err) {
      // Remove temporary messages on error
      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => !m.id.startsWith("temp-") && !m.id.startsWith("processing-")),
            }
          : null,
      )

      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
      console.error("Send message error:", err)
      throw err
    }
  }

  // Delete a conversation
  const deleteChat = async (chatId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to delete from API, but continue even if it fails
      try {
        await chatAPI.deleteConversation(chatId)
      } catch (apiError) {
        console.warn("Failed to delete conversation from API, removing locally:", apiError)
      }

      setChats((prev: Chat[]) => prev.filter((chat) => chat.id !== chatId))
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete conversation"
      setError(errorMessage)
      console.error("Delete conversation error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize app on mount
  useEffect(() => {
    initializeApp()
  }, [])

  return {
    chats,
    currentChat,
    isLoading,
    error,
    connectionStatus,
    loadChats,
    createChat,
    loadChat,
    sendMessage,
    deleteChat,
    setCurrentChat,
    initializeApp,
  }
}

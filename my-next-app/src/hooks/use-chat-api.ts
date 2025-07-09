"use client"

import { useState, useEffect, useRef } from "react"
import { chatAPI, convertApiConversation } from "@/lib/api"
import type { Message, Chat } from "@/types/chat"

export function useChatAPI() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")

  // Ref to prevent double initialization
  const isInitialized = useRef(false)
  const isInitializing = useRef(false)

  // Test connection and load conversations
  const initializeApp = async () => {
    // Prevent double initialization
    if (isInitializing.current || isInitialized.current) {
      console.log("App already initialized or initializing, skipping...")
      return
    }

    try {
      isInitializing.current = true
      setIsLoading(true)
      setError(null)
      setConnectionStatus("connecting")

      console.log("=== INITIALIZING APP ===")

      // Test connection first
      const isConnected = await chatAPI.testConnection()

      if (isConnected) {
        setConnectionStatus("connected")
        console.log("Connection successful, loading chats...")
        // Load conversations if connection is successful
        await loadChats()
        isInitialized.current = true
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
      isInitializing.current = false
    }
  }

  // Load all conversations for the current user (just titles and IDs for sidebar)
  const loadChats = async () => {
    try {
      console.log("=== LOADING CHATS ===")
      setError(null)

      const apiConversations = await chatAPI.getConversations()
      console.log("Raw API conversations received:", apiConversations)
      console.log("Number of conversations:", apiConversations?.length || 0)

      // Handle case where apiConversations might be undefined or null
      if (!apiConversations) {
        console.warn("API returned null/undefined conversations, using empty array")
        setChats([])
        return
      }

      // Ensure it's an array
      if (!Array.isArray(apiConversations)) {
        console.error("API conversations is not an array:", typeof apiConversations, apiConversations)
        setChats([])
        return
      }

      // Convert to simple chat objects (just for sidebar display)
      const simplifiedChats: Chat[] = []

      for (let i = 0; i < apiConversations.length; i++) {
        const apiConversation = apiConversations[i]
        console.log(`Processing conversation ${i + 1}/${apiConversations.length}:`, apiConversation)

        try {
          // Validate conversation structure
          if (!apiConversation.conversation_id || !apiConversation.title) {
            console.warn("Invalid conversation structure, skipping:", apiConversation)
            continue
          }

          // Create simplified chat object (no messages, just for sidebar)
          const simplifiedChat: Chat = {
            id: apiConversation.conversation_id,
            title: apiConversation.title,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: [], // Empty for now, will be loaded when user clicks
          }

          simplifiedChats.push(simplifiedChat)
          console.log(`Successfully processed conversation ${apiConversation.conversation_id}`)
        } catch (conversionError) {
          console.error(`Failed to process conversation ${apiConversation.conversation_id}:`, conversionError)
        }
      }

      console.log(`=== SETTING ${simplifiedChats.length} CHATS ===`)
      console.log("Final simplified chats:", simplifiedChats)

      setChats(simplifiedChats)
      console.log(`Successfully loaded ${simplifiedChats.length} conversations`)
    } catch (err) {
      console.error("=== LOAD CHATS ERROR ===")
      const errorMessage = err instanceof Error ? err.message : "Failed to load conversations"
      setError(errorMessage)
      console.error("Load conversations error:", err)
      // Set empty array on error to prevent undefined issues
      setChats([])
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

      // Process request_id
      let dpRequestId: string | undefined = undefined

      console.log("Processing request_id from new chat response:", aiResponse.request_id)

      if (aiResponse.request_id && aiResponse.request_id > 0) {
        dpRequestId = aiResponse.request_id.toString()
        console.log("Found request_id in new chat:", dpRequestId)
      }

      // Step 3: Create the chat object with both messages
      const newChat: Chat = {
        id: newConversation.conversation_id,
        title: newConversation.title,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: `user-${aiResponse.message_id}`,
            content: aiResponse.input,
            role: "user",
            timestamp: new Date(),
            messageId: aiResponse.message_id.toString(),
          },
          {
            id: `assistant-${aiResponse.message_id}`,
            content: aiResponse.response,
            role: "assistant",
            timestamp: new Date(),
            messageId: aiResponse.message_id.toString(),
            feedback: aiResponse.feedback,
            dpRequestId: dpRequestId,
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

  // Load a specific conversation with its messages (when user clicks on it)
  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`Loading full conversation: ${chatId}`)

      // Check if we already have the full conversation loaded
      const existingChat = chats.find((chat) => chat.id === chatId)
      if (existingChat && existingChat.messages.length > 0) {
        console.log("Chat already loaded with messages, using cached version")
        setCurrentChat(existingChat)
        return existingChat
      }

      // Try to get the full conversation from the API
      try {
        const apiConversation = await chatAPI.getConversation(chatId)
        const fullChat = convertApiConversation(apiConversation)
        setCurrentChat(fullChat)

        // Update the chat in the list with loaded messages
        setChats((prev) => prev.map((c) => (c.id === chatId ? fullChat : c)))

        console.log(`Loaded full conversation with ${fullChat.messages.length} messages`)
        return fullChat
      } catch (apiError) {
        // If API doesn't support individual conversation fetching, use the simplified version
        if (existingChat) {
          console.log("API doesn't support individual conversation fetching, using simplified version")
          setCurrentChat(existingChat)
          return existingChat
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

      // Process request_id
      let dpRequestId: string | undefined = undefined

      console.log("Processing request_id from message response:", aiResponse.request_id)

      if (aiResponse.request_id && aiResponse.request_id > 0) {
        dpRequestId = aiResponse.request_id.toString()
        console.log("Found request_id in message response:", dpRequestId)
      }

      // Create real messages using the API response format
      const realUserMessage: Message = {
        id: `user-${aiResponse.message_id}`,
        content: aiResponse.input,
        role: "user",
        timestamp: new Date(),
        messageId: aiResponse.message_id.toString(),
      }

      const assistantMessage: Message = {
        id: `assistant-${aiResponse.message_id}`,
        content: aiResponse.response,
        role: "assistant",
        timestamp: new Date(),
        messageId: aiResponse.message_id.toString(),
        feedback: aiResponse.feedback,
        dpRequestId: dpRequestId,
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

  // Submit feedback for a message
  const submitFeedback = async (messageId: string, rating: number, comment?: string) => {
    try {
      await chatAPI.submitFeedback(messageId, rating, comment)

      // Update the message with feedback in current chat
      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((message) =>
                message.messageId === messageId
                  ? {
                      ...message,
                      feedback: { rating, comment: comment || "" },
                    }
                  : message,
              ),
            }
          : null,
      )

      // Update the message in chats list as well
      setChats((prev: Chat[]) =>
        prev.map((chat) =>
          chat.id === currentChat?.id
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message.messageId === messageId
                    ? {
                        ...message,
                        feedback: { rating, comment: comment || "" },
                      }
                    : message,
                ),
              }
            : chat,
        ),
      )

      console.log(`Feedback submitted for message ${messageId}: rating=${rating}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit feedback"
      setError(errorMessage)
      console.error("Submit feedback error:", err)
      throw err
    }
  }

  // Manual retry function for connection issues
  const retryInitialization = async () => {
    // Reset initialization flags to allow retry
    isInitialized.current = false
    isInitializing.current = false
    await initializeApp()
  }

  // Initialize app on mount - with proper dependency array and cleanup
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (isMounted && !isInitialized.current && !isInitializing.current) {
        await initializeApp()
      }
    }

    initialize()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - only run once on mount

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
    submitFeedback,
    setCurrentChat,
    initializeApp: retryInitialization, // Use the retry version for manual calls
  }
}

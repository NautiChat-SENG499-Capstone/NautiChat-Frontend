"use client";

import { useState, useEffect, useRef } from "react";
import { chatAPI, convertApiConversation } from "@/lib/api";
import type { Message, Chat } from "@/types/chat";

export function useChatAPI() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");

  const isInitialized = useRef(false);
  const isInitializing = useRef(false);

  const initializeApp = async () => {
    if (isInitializing.current || isInitialized.current) return;

    try {
      isInitializing.current = true;
      setIsLoading(true);
      setError(null);
      setConnectionStatus("connecting");

      const isConnected = await chatAPI.testConnection();

      if (isConnected) {
        setConnectionStatus("connected");
        await loadChats();

        // Try to restore last chat
        const lastChatId = localStorage.getItem("currentChatId");
        if (lastChatId) {
          try {
            await loadChat(lastChatId);
          } catch (err) {
            console.warn("Failed to restore previous chat", err);
            localStorage.removeItem("currentChatId");
          }
        }

        isInitialized.current = true;
      } else {
        setConnectionStatus("error");
        setError("Unable to connect to the API server. Please check your connection.");
      }
    } catch (err) {
      setConnectionStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize app";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isInitializing.current = false;
    }
  };


  const loadChats = async () => {
    try {
      setError(null);
      const apiConversations = await chatAPI.getConversations();
      if (!apiConversations || !Array.isArray(apiConversations)) {
        setChats([]);
        return;
      }
      const simplifiedChats: Chat[] = apiConversations
        .filter((c) => c.conversation_id && c.title)
        .map((apiConversation) => ({
          id: apiConversation.conversation_id,
          title: apiConversation.title,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        }));
      setChats(simplifiedChats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
      setChats([]);
    }
  };

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
            id: `${aiResponse.message_id}`,
            content: aiResponse.response,
            role: "assistant",
            timestamp: new Date(),
            messageId: aiResponse.message_id.toString(),
            feedback: aiResponse.feedback,
            dpRequestId: dpRequestId,
            onc_api_url: aiResponse.onc_api_url,
          },
        ],
      };
      setChats((prev) => [newChat, ...prev]);
      setCurrentChat(newChat);
      return newChat;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create conversation";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const existingChat = chats.find((chat) => chat.id === chatId);
      if (existingChat && existingChat.messages.length > 0) {
        setCurrentChat(existingChat);
        return existingChat;
      }
      const apiConversation = await chatAPI.getConversation(chatId);
      const fullChat = convertApiConversation(apiConversation);
      setCurrentChat(fullChat);
      setChats((prev) => prev.map((c) => (c.id === chatId ? fullChat : c)));
      return fullChat;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversation";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, chatId: string) => {
    if (!currentChat || currentChat.id !== chatId) {
      throw new Error("No active conversation");
    }

    try {
      setIsLoading(true);
      setError(null);

      // THE FIX IS HERE: Use crypto.randomUUID() for a unique, client-safe ID
      const userMessage: Message = {
        id: `temp-user-${crypto.randomUUID()}`,
        content,
        role: "user",
        timestamp: new Date(),
      };

      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, userMessage],
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
      };
      const assistantMessage: Message = {
        id: `${aiResponse.message_id}`,
        content: aiResponse.response,
        role: "assistant",
        timestamp: new Date(),
        messageId: aiResponse.message_id.toString(),
        feedback: aiResponse.feedback,
        dpRequestId: dpRequestId,
      }

      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages.filter((m) => !m.id.startsWith("temp-")),
                realUserMessage,
                assistantMessage,
              ],
            }
          : null
      );

      setChats((prev: Chat[]) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, realUserMessage, assistantMessage],
                updatedAt: new Date(),
              }
            : chat
        )
      );
    } catch (err) {
      setCurrentChat((prev: Chat | null) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter(
                (m) => !m.id.startsWith("temp-")
              ),
            }
          : null
      );
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (
    messageId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      await chatAPI.submitFeedback(messageId, rating, comment);
      const updateFeedback = (messages: Message[]) =>
        messages.map((message) =>
          message.messageId === messageId
            ? { ...message, feedback: { rating, comment: comment || "" } }
            : message
        );
      setCurrentChat((prev) =>
        prev ? { ...prev, messages: updateFeedback(prev.messages) } : null
      );
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat?.id
            ? { ...chat, messages: updateFeedback(chat.messages) }
            : chat
        )
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit feedback";
      setError(errorMessage);
      throw err;
    }
  };

  const retryInitialization = async () => {
    isInitialized.current = false;
    isInitializing.current = false;
    await initializeApp();
  };

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      if (isMounted && !isInitialized.current && !isInitializing.current) {
        await initializeApp();
      }
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, []);

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
    initializeApp: retryInitialization,
  };
}

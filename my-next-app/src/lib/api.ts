import axios, { type AxiosInstance, type AxiosResponse } from "axios"
import type { Message } from "@/types/chat"
import type {
  ApiMessage,
  ApiConversation,
  CreateConversationRequest,
  CreateConversationResponse,
  MessageRequest,
  MessageResponse,
  ConversationsResponse,
} from "@/types/chat"

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://nautichat-api-1050974581549.northamerica-northeast1.run.app"

// API client class
export class ChatAPI {
  private client: AxiosInstance

  constructor(baseUrl: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 60000, // 60 seconds timeout for LLM responses
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    })

    // Request interceptor for adding auth tokens and logging
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token from localStorage
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log("Added auth token to request")
        }

        console.log(`Making ${config.method?.toUpperCase()} request to ${config.baseURL}${config.url}`)
        console.log("Request headers:", {
          ...config.headers,
          Authorization: config.headers.Authorization ? "[REDACTED]" : undefined,
        })
        if (config.data) {
          console.log("Request data:", config.data)
        }
        return config
      },
      (error) => {
        console.error("Request setup error:", error)
        return Promise.reject(error)
      },
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Response from ${response.config.url}:`, response.status)
        console.log("Response data:", response.data)
        return response
      },
      (error) => {
        console.error("API Error Details:", {
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
          },
          response: error.response
            ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers,
              }
            : null,
          request: error.request ? "Request was made but no response received" : null,
        })

        if (error.response) {
          switch (error.response.status) {
            case 401:
              console.error("Unauthorized access - token may be invalid or expired")
              break
            case 403:
              console.error("Forbidden access")
              break
            case 404:
              console.error("Resource not found")
              break
            case 422:
              console.error("Validation error:", error.response.data)
              break
            case 500:
              console.error("Internal server error")
              break
            default:
              console.error("Unknown server error")
          }
        } else if (error.request) {
          console.error("Network error - possible CORS issue or server unreachable")
          console.error("Request details:", {
            url: error.config?.baseURL + error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
          })
        } else {
          console.error("Request setup error:", error.message)
        }

        return Promise.reject(error)
      },
    )
  }

  // Helper method for token retrieval
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token")
    }
    return null
  }

  // POST /llm/conversations - Create a new conversation
  async createConversation(title?: string): Promise<CreateConversationResponse> {
    try {
      console.log(`Creating new conversation: "${title || "Untitled"}"`)

      const payload: CreateConversationRequest = {
        ...(title && { title }),
      }

      const response = await this.client.post<CreateConversationResponse>("/llm/conversations", payload)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Unable to connect to the server. Please check if the API is running and CORS is configured properly.",
          )
        }
        const errorDetail = error.response?.data?.detail || error.message
        throw new Error(`Failed to create conversation: ${errorDetail}`)
      }
      throw new Error("Failed to create conversation: Unknown error")
    }
  }

  // POST /llm/messages - Generate a response
  async sendMessage(input: string, conversationId: string): Promise<MessageResponse> {
    try {
      console.log(
        `Sending message to conversation ${conversationId}: "${input.substring(0, 50)}${input.length > 50 ? "..." : ""}"`,
      )

      const payload: MessageRequest = {
        input,
        conversation_id: conversationId,
      }

      const response = await this.client.post<MessageResponse>("/llm/messages", payload)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Unable to connect to the server. Please check if the API is running and CORS is configured properly.",
          )
        }
        const errorDetail = error.response?.data?.detail || error.message
        throw new Error(`Failed to send message: ${errorDetail}`)
      }
      throw new Error("Failed to send message: Unknown error")
    }
  }

  // GET /llm/conversations - Get all conversations
  async getConversations(): Promise<ApiConversation[]> {
    try {
      console.log("Fetching all conversations...")

      const response = await this.client.get<ConversationsResponse | ApiConversation[]>("/llm/conversations")

      // Handle different response formats
      if (Array.isArray(response.data)) {
        // Direct array response
        console.log("Received direct array response with", response.data.length, "conversations")
        return response.data
      } else if (response.data && "conversations" in response.data) {
        // Wrapped response
        console.log("Received wrapped response with", response.data.conversations.length, "conversations")
        return response.data.conversations
      } else {
        // Fallback for unexpected format
        console.warn("Unexpected response format:", response.data)
        return []
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Unable to connect to the server. Please check if the API is running and CORS is configured properly.",
          )
        }
        const errorDetail = error.response?.data?.detail || error.message
        throw new Error(`Failed to fetch conversations: ${errorDetail}`)
      }
      throw new Error("Failed to fetch conversations: Unknown error")
    }
  }

  // GET /llm/conversations/{conversation_id} - Get a specific conversation
  async getConversation(conversationId: string): Promise<ApiConversation> {
    try {
      console.log(`Fetching conversation: ${conversationId}`)

      const response = await this.client.get<ApiConversation>(`/llm/conversations/${conversationId}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Unable to connect to the server. Please check if the API is running and CORS is configured properly.",
          )
        }
        const errorDetail = error.response?.data?.detail || error.message
        throw new Error(`Failed to fetch conversation: ${errorDetail}`)
      }
      throw new Error("Failed to fetch conversation: Unknown error")
    }
  }

  // DELETE /llm/conversations/{conversation_id} - Delete a conversation (if supported)
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      console.log(`Deleting conversation: ${conversationId}`)

      await this.client.delete(`/llm/conversations/${conversationId}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Unable to connect to the server. Please check if the API is running and CORS is configured properly.",
          )
        }
        const errorDetail = error.response?.data?.detail || error.message
        throw new Error(`Failed to delete conversation: ${errorDetail}`)
      }
      throw new Error("Failed to delete conversation: Unknown error")
    }
  }

  // Test connection to the API
  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing API connection...")

      // Try to fetch conversations as a connection test
      await this.client.get("/llm/conversations")
      console.log("API connection successful")
      return true
    } catch (error) {
      console.error("API connection failed:", error)
      return false
    }
  }
}

// Create a singleton instance
export const chatAPI = new ChatAPI()

// Helper function to convert API message to local message format
export function convertApiMessage(apiMessage: ApiMessage): Message[] {
  // Convert the API message format to our local format
  // Each API message contains both user input and assistant response
  const messages: Message[] = []

  // Add user message
  messages.push({
    id: `user-${apiMessage.message_id}`,
    content: apiMessage.input,
    role: "user",
    timestamp: new Date(), // API doesn't provide timestamp, use current time
  })

  // Add assistant message
  messages.push({
    id: `assistant-${apiMessage.message_id}`,
    content: apiMessage.input,
    role: "assistant",
    timestamp: new Date(), // API doesn't provide timestamp, use current time
  })

  return messages
}

// Helper function to convert API conversation to local chat format
export function convertApiConversation(apiConversation: ApiConversation) {
  // Flatten all messages from API format
  const allMessages: Message[] = []

  if (apiConversation.messages) {
    apiConversation.messages.forEach((apiMessage) => {
      const convertedMessages = convertApiMessage(apiMessage)
      allMessages.push(...convertedMessages)
    })
  }

  return {
    id: apiConversation.id,
    title: apiConversation.title,
    createdAt: new Date(apiConversation.created_at),
    updatedAt: new Date(apiConversation.updated_at),
    messages: allMessages,
  }
}

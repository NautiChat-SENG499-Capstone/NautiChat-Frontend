import axios, { type AxiosInstance, type AxiosResponse } from "axios"
import type { Message } from "@/types/chat"
import type {
  ApiMessage,
  ApiConversation,
  CreateConversationRequest,
  CreateConversationResponse,
  MessageRequest,
  MessageResponse,
  FeedbackRequest,
  UserInfo,
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
      timeout: 6000000000000,
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

  // Helper method to get user_id from token or localStorage
  private getUserId(): string | null {
    if (typeof window !== "undefined") {
      // Try to get user_id from localStorage first
      const userId = localStorage.getItem("user_id") || localStorage.getItem("userId")
      if (userId) {
        console.log("Found user_id in localStorage:", userId)
        return userId
      }

      // If not found, try to decode from JWT token
      const token = this.getAuthToken()
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          console.log("JWT payload:", payload)
          const extractedUserId = payload.user_id || payload.sub || payload.id || null
          console.log("Extracted user_id from token:", extractedUserId)
          return extractedUserId
        } catch (error) {
          console.warn("Could not decode user_id from token:", error)
        }
      }
    }
    console.log("No user_id found")
    return null
  }

  // GET /auth/me - Get current user info including ONC token
  async getUserInfo(): Promise<UserInfo> {
    try {
      console.log("Fetching user info...")

      const response = await this.client.get<UserInfo>("/auth/me")
      console.log("User info received:", { ...response.data, onc_token: "[REDACTED]" })
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
        throw new Error(`Failed to fetch user info: ${errorDetail}`)
      }
      throw new Error("Failed to fetch user info: Unknown error")
    }
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

  // POST /llm/messages/{message_id}/feedback - Submit feedback for a message
  async submitFeedback(messageId: string, rating: number, comment?: string): Promise<void> {
    try {
      console.log(`Submitting feedback for message ${messageId}: rating=${rating}`)

      const payload: FeedbackRequest = {
        rating,
        comment: comment || "",
      }

      await this.client.patch(`/llm/messages/${messageId}/feedback`, payload)
      console.log("Feedback submitted successfully")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (error.response?.status === 404) {
          throw new Error("Message not found.")
        }
        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Unable to connect to the server. Please check if the API is running and CORS is configured properly.",
          )
        }
        const errorDetail = error.response?.data?.detail || error.message
        throw new Error(`Failed to submit feedback: ${errorDetail}`)
      }
      throw new Error("Failed to submit feedback: Unknown error")
    }
  }

  // GET /llm/conversations - Get all conversations for the current user
  async getConversations(): Promise<ApiConversation[]> {
    try {
      console.log("=== FETCHING CONVERSATIONS ===")

      const userId = this.getUserId()
      console.log("Current user_id for conversation fetch:", userId)

      // Try the basic endpoint first
      console.log("Trying basic /llm/conversations endpoint...")
      const response = await this.client.get<any>("/llm/conversations")

      console.log("Raw response type:", typeof response.data)
      console.log("Raw response data:", response.data)
      console.log("Is array?", Array.isArray(response.data))

      // Handle different response formats
      let conversations: ApiConversation[] = []

      if (Array.isArray(response.data)) {
        // Direct array response
        console.log("Processing as direct array response")
        conversations = response.data
      } else if (response.data && typeof response.data === "object") {
        // Check for various possible wrapper properties
        if ("conversations" in response.data && Array.isArray(response.data.conversations)) {
          console.log("Processing as wrapped response with 'conversations' property")
          conversations = response.data.conversations
        } else if ("data" in response.data && Array.isArray(response.data.data)) {
          console.log("Processing as wrapped response with 'data' property")
          conversations = response.data.data
        } else if ("results" in response.data && Array.isArray(response.data.results)) {
          console.log("Processing as wrapped response with 'results' property")
          conversations = response.data.results
        } else {
          console.warn("Unknown response format, checking for array-like properties...")
          // Try to find any array property
          const keys = Object.keys(response.data)
          for (const key of keys) {
            if (Array.isArray(response.data[key])) {
              console.log(`Found array property '${key}', using it as conversations`)
              conversations = response.data[key]
              break
            }
          }
        }
      }

      console.log(`Processed ${conversations.length} conversations`)
      console.log("Sample conversation:", conversations[0])

      return conversations
    } catch (error) {
      console.error("=== CONVERSATION FETCH ERROR ===")
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

  // GET /health - Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      console.log("Checking API health...")

      const response = await this.client.get<{ status: string }>("/health")

      console.log("Health check response:", response.data)

      // Check if the response indicates the API is healthy
      const isHealthy = response.data && response.data.status === "healthy"

      if (isHealthy) {
        console.log("API health check passed")
      } else {
        console.warn("API health check failed - unexpected response:", response.data)
      }

      return isHealthy
    } catch (error) {
      console.error("API health check failed:", error)
      return false
    }
  }

  // Test connection to the API using the health endpoint
  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing API connection using health endpoint...")

      const isHealthy = await this.healthCheck()

      if (isHealthy) {
        console.log("API connection test successful")
      } else {
        console.error("API connection test failed - health check returned unhealthy status")
      }

      return isHealthy
    } catch (error) {
      console.error("API connection test failed:", error)
      return false
    }
  }
}

// Helper function to convert API message to local message format
function convertApiMessage(apiMessage: ApiMessage): Message[] {
  // Convert the API message format to our local format
  // Each API message contains both user input and assistant response
  const messages: Message[] = []

  // Add user message
  messages.push({
    id: `user-${apiMessage.message_id}`,
    content: apiMessage.input,
    role: "user",
    timestamp: new Date(), // Use current time since API doesn't provide timestamps
    messageId: apiMessage.message_id.toString(),
  })

  // Process request_id (data product request)
  let dpRequestId: string | undefined = undefined

  console.log("Processing API message request_id:", apiMessage.request_id)

  if (apiMessage.request_id && apiMessage.request_id > 0) {
    dpRequestId = apiMessage.request_id.toString()
    console.log("Found request_id:", dpRequestId)
  }

  // Add assistant message with request_id
  messages.push({
    id: `${apiMessage.message_id}`,
    content: apiMessage.response,
    role: "assistant",
    timestamp: new Date(), // Use current time since API doesn't provide timestamps
    messageId: apiMessage.message_id.toString(),
    feedback: apiMessage.feedback,
    dpRequestId: dpRequestId,
    onc_api_url: apiMessage.onc_api_url,
  })

  return messages
}

// Helper function to convert API conversation to local chat format
function convertApiConversation(apiConversation: ApiConversation) {
  console.log("Converting API conversation:", apiConversation)

  // Flatten all messages from API format
  const allMessages: Message[] = []

  if (apiConversation.messages && Array.isArray(apiConversation.messages)) {
    console.log(
      `Converting ${apiConversation.messages.length} messages for conversation ${apiConversation.conversation_id}`,
    )
    apiConversation.messages.forEach((apiMessage) => {
      const convertedMessages = convertApiMessage(apiMessage)
      allMessages.push(...convertedMessages)
    })
  } else {
    console.log(`No messages found for conversation ${apiConversation.conversation_id}`)
  }

  const convertedChat = {
    id: apiConversation.conversation_id,
    title: apiConversation.title,
    createdAt: new Date(), // Use current time since API doesn't provide dates
    updatedAt: new Date(), // Use current time since API doesn't provide dates
    messages: allMessages,
  }

  console.log("Converted chat:", convertedChat)
  return convertedChat
}

// Create a singleton instance
const chatAPI = new ChatAPI()

// Export the functions and instance
export { chatAPI, convertApiConversation }

// API for the admin
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default api;

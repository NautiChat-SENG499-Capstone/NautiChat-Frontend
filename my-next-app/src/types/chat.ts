export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  messageId?: string
  feedback?: {
    rating: number
    comment: string
  }
  dpRequestId?: string
  onc_api_url?: string
}

export interface Chat {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export interface ChatGroup {
  title: string
  chats: Chat[]
}

// API-specific types matching your actual FastAPI endpoints
export interface ApiMessage {
  message_id: number
  conversation_id: number
  user_id: number
  input: string
  response: string
  request_id?: number // Only data product request ID
  feedback?: {
    rating: number
    comment: string
  }
  onc_api_url?: string
}

export interface ApiConversation {
  conversation_id: string
  title: string
  messages?: ApiMessage[]
}

// Request/Response types for your actual endpoints
export interface CreateConversationRequest {
  title?: string
}

export interface CreateConversationResponse {
  conversation_id: string
  title: string
}

export interface MessageRequest {
  input: string
  conversation_id: string
}

export interface MessageResponse {
  message_id: number
  conversation_id: number
  user_id: number
  input: string
  response: string
  request_id?: number // Only data product request ID
  feedback?: {
    rating: number
    comment: string
  }
}

export interface FeedbackRequest {
  rating: number
  comment: string
}

export interface ConversationsResponse {
  conversations: ApiConversation[]
}

// User info from /auth/me endpoint
export interface UserInfo {
  id: number
  username: string
  onc_token: string
  is_admin: boolean
}

// Ocean Networks Canada API response types
export interface ONCDataProductResponse {
  status: string
  dpRunId?: string
  message?: string
}

// Types for data product delivery
export interface DataProductStatus {
  status: "queued" | "running" | "complete" | "error"
  message?: string
  downloadUrl?: string
}

export interface DataProductRunResponse {
  success: boolean
  message?: string
}

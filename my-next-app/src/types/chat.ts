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
  feedback?: {
    rating: number
    comment: string
  }
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

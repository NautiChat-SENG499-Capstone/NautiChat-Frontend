"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Check } from "lucide-react"

interface MessageFeedbackProps {
  messageId: string
  onFeedback: (messageId: string, rating: number, comment?: string) => Promise<void>
  disabled?: boolean
  currentFeedback?: number | null
}

export function MessageFeedback({ messageId, onFeedback, disabled = false, currentFeedback }: MessageFeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<number | null>(currentFeedback || null)

  const handleFeedback = async (rating: number) => {
    if (isSubmitting || disabled || feedback !== null) return

    try {
      setIsSubmitting(true)
      const comment = rating === 2 ? "thumbs up" : "thumbs down"
      await onFeedback(messageId, rating, comment)
      setFeedback(rating)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If feedback has been given, show confirmation
  if (feedback !== null) {
    return (
      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
        <Check className="h-4 w-4 text-green-500" />
        <span>Thank you for your feedback!</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3 mt-3">
      <span className="text-sm text-gray-600">Was that helpful?</span>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFeedback(2)}
          disabled={isSubmitting || disabled}
          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFeedback(1)}
          disabled={isSubmitting || disabled}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

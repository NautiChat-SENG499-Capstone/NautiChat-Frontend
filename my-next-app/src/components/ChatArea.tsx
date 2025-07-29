"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageFeedback } from "./MessageFeedback"
import { DownloadLinks } from "./DownloadLinks"
import { AnimatedProcessingText } from "./AnimatedProcessingText"
import type { Message } from "@/types/chat"
import TTSButton from "@/components/TTSButton"
import OncApiQueryButton from "@/components/OncApiQueryButton"
import { TerritorialAcknowledgement } from "@/components/TerritorialAcknowledgement"
import OncApiDownloadStarter from "@/components/OncDownloadStarter"
import { useDownloadManager } from "@/hooks/use-download-manager"

// Markdown rendering
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatAreaProps {
  messages?: Message[]
  title?: string
  example?: string
  onFeedback?: (
    messageId: string,
    rating: number,
    comment?: string
  ) => Promise<void>
  isLoading?: boolean
  streamingResponse?: string
}

export function ChatArea({
  messages = [],
  title = "What do you want to know?",
  example = "",
  onFeedback,
  isLoading = false,
  streamingResponse = "",
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { activeDownloads } = useDownloadManager()

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, streamingResponse])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 min-h-0">
        <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-4xl font-semibold text-gray-800">{title}</h2>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base text-gray-600 font-medium">Examples:</p>
            <p className="text-base sm:text-lg text-gray-800">{"What instruments are on the Cambridge Bay observatory?"}</p>
            <p className="text-base sm:text-lg text-gray-800">{"What was the temperature in Cambridge Bay on this day last year?"}</p>
            <p className="text-base sm:text-lg text-gray-800">{"I want to request scalar depth data from the NAV device at CBYDS from august 18th 2015 to august 19th 2015"}</p>
          </div>
          <TerritorialAcknowledgement />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden">
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
        <div className="px-2 sm:px-4 md:px-6 py-4">
          <div className="max-w-full space-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user"
              const messageTime = message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""

              const showDownloadStarter =
                message.role === "assistant" &&
                message.onc_api_url &&
                (!message.dpRequestId ||
                  (message.dpRequestId &&
                    activeDownloads[message.dpRequestId]?.status !== "complete"))

              return (
                <div key={message.id}>
                  <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`w-fit max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-200 text-gray-800 rounded-bl-md"
                      } ${message.content === "Processing..." ? "animate-pulse" : ""}`}
                    >
                      <div className="prose prose-sm max-w-none markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          isUser ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {messageTime}
                      </p>
                    </div>
                  </div>

                  {message.role === "assistant" && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] ml-0">
                        <div className="flex gap-2 mt-1">
                          <TTSButton text={message.content} />
                          <OncApiQueryButton oncApiUrl={message.onc_api_url} />
                        </div>
                      </div>
                    </div>
                  )}

                  {showDownloadStarter && message.onc_api_url && (
                    <div className="max-w-[70%] ml-0">
                      <div className="flex gap-2 mt-1">
                        <OncApiDownloadStarter oncApiUrl={message.onc_api_url} />
                      </div>
                    </div>
                  )}

                  {message.role === "assistant" &&
                    message.content !== "Processing..." &&
                    message.dpRequestId &&
                    message.dpRequestId.trim() !== "" && (
                      <div className="flex justify-start">
                        <div className="w-fit max-w-[85%] sm:max-w-[75%] ml-0">
                          <DownloadLinks dpRequestId={message.dpRequestId} />
                        </div>
                      </div>
                    )}

                  {message.role === "assistant" &&
                    message.id &&
                    onFeedback && (
                      <div className="flex justify-start">
                        <div className="w-fit max-w-[85%] sm:max-w-[75%] ml-0">
                          <MessageFeedback
                            messageId={message.id}
                            onFeedback={onFeedback}
                            currentFeedback={message.feedback?.rating}
                          />
                        </div>
                      </div>
                    )}
                </div>
              )
            })}

            {isLoading && !streamingResponse && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="w-fit max-w-[85%] sm:max-w-[75%] min-h-[40px] flex items-center rounded-2xl px-3 py-2 bg-gray-200 rounded-bl-md">
                  <AnimatedProcessingText />
                </div>
              </div>
            )}

            {streamingResponse && (
              <div className="flex justify-start">
                <div className="w-fit max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 bg-gray-200 text-gray-800 rounded-bl-md">
                  <div className="prose prose-sm max-w-none markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

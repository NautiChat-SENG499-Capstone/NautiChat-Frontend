"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageFeedback } from "./MessageFeedback";
import { DownloadLinks } from "./DownloadLinks";
import { AnimatedProcessingText } from "./AnimatedProcessingText";
import type { Message } from "@/types/chat";
import TTSButton from "@/components/TTSButton";

interface ChatAreaProps {
  messages?: Message[];
  title?: string;
  example?: string;
  onFeedback?: (
    messageId: string,
    rating: number,
    comment?: string
  ) => Promise<void>;
  isLoading?: boolean;
  streamingResponse?: string;
}

export function ChatArea({
  messages = [],
  title = "What do you want to know?",
  example = "What is the average temperature in Cambridge Bay?",
  onFeedback,
  isLoading = false,
  streamingResponse = "",
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingResponse]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h2 className="text-4xl font-semibold text-gray-800">{title}</h2>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">Example:</p>
            <p className="text-gray-800">{example}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
        <div className="p-4">
          <div className="max-w-1xl mx-auto space-y-4">
            {messages.map((message, index) => {
              return (
                <div key={message.id}>
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-200 text-gray-800 rounded-bl-md"
                      } ${message.content === "Processing..." ? "animate-pulse" : ""}`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.content === "Processing..." ? (
                          <>
                            Processing
                            <span className="inline-block ml-1">
                              <span className="animate-pulse">.</span>
                              <span className="animate-pulse animation-delay-200">.</span>
                              <span className="animate-pulse animation-delay-400">.</span>
                            </span>
                          </>
                        ) : (
                          message.content
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                {message.role === "assistant" &&
                  (<div className="flex justify-start">
                    <div className="max-w-[70%] ml-0">
                      <TTSButton text={message.content} />
                    </div>
                  </div>
                )}
                  {/* Show data product download if request_id exists */}
                  {message.role === "assistant" &&
                    message.content !== "Processing..." &&
                    message.dpRequestId &&
                    message.dpRequestId.trim() !== "" && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] ml-0">
                          <DownloadLinks dpRequestId={message.dpRequestId} />
                        </div>
                      </div>
                    )}

                  {message.role === "assistant" &&
                    message.id &&
                    onFeedback && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] ml-0">
                          <MessageFeedback
                            messageId={message.id}
                            onFeedback={onFeedback}
                            currentFeedback={message.feedback?.rating}
                          />
                        </div>
                      </div>
                    )}
                </div>
              );
            })}

            {/* Use AnimatedProcessingText when loading */}
            {isLoading && !streamingResponse && (
              <div className="flex justify-start">
                <div className="max-w-[70%] min-h-[40px] flex items-center rounded-2xl px-4 py-3 bg-gray-200 rounded-bl-md">
                  <AnimatedProcessingText />
                </div>
              </div>
            )}

            {/* Display the streaming response */}
            {streamingResponse && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gray-200 text-gray-800 rounded-bl-md">
                  <p className="text-sm leading-relaxed">
                    {streamingResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
"use client"
import React from "react"

export function AnimatedProcessingText() {
  const text = "Processing..."
  return (
    <div className="flex items-center text-sm text-gray-800">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="animate-wave-text"
          style={{ animationDelay: `${index * 0.07}s` }}
        >
          {/* Use a non-breaking space for space characters */}
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  )
}
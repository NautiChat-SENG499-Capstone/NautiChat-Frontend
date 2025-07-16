"use client"
import React from "react"

export function WaveIndicator() {
  return (
    <div className="flex items-end space-x-1 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-4 rounded bg-gray-400 animate-wave"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

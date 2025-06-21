"use client"

import { RefreshCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "error"
  error?: string | null
  onRetry: () => void
  isLoading: boolean
}

export function ConnectionStatus({ status, error, onRetry, isLoading }: ConnectionStatusProps) {
  if (status === "connected") {
    return null // Don't show anything when connected
  }

  if (status === "connecting") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">Connecting...</h3>
            <p className="text-sm text-blue-600">Establishing connection to the API server...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-center space-x-3">
        <WifiOff className="h-5 w-5 text-red-500" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
          <p className="text-sm text-red-600">
            {error || "Unable to connect to the server. This might be a CORS issue or the server might be unreachable."}
          </p>
          <div className="mt-2 text-xs text-red-500">
            <p>Troubleshooting tips:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Check if the API server is running</li>
              <li>Verify CORS is configured for your domain</li>
              <li>Check your network connection</li>
            </ul>
          </div>
        </div>
        <Button
          onClick={onRetry}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Retry"}
        </Button>
      </div>
    </div>
  )
}

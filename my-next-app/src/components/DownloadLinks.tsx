"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Clock, AlertCircle } from "lucide-react"
import { useDownloadManager } from "@/hooks/use-download-manager"

interface DownloadLinksProps {
  dpRequestId: string
  className?: string
}

export function DownloadLinks({ dpRequestId, className = "" }: DownloadLinksProps) {
  const { activeDownloads, startDownload } = useDownloadManager()
  const downloadJob = activeDownloads[dpRequestId]

  // Ensure polling starts on mount if it hasn't already
  useEffect(() => {
    if (!downloadJob) {
      startDownload(dpRequestId)
    }
  }, [dpRequestId, downloadJob, startDownload])

  const handleButtonClick = () => {
    if (downloadJob?.status === "complete" && downloadJob.downloadUrl) {
      window.open(downloadJob.downloadUrl, "_blank", "noopener,noreferrer")
    } else {
      startDownload(dpRequestId)
    }
  }

  const getStatusDisplay = () => {
    if (!downloadJob) {
      return {
        icon: <Download className="h-4 w-4" />,
        text: "Checking Status...",
        variant: "outline" as const,
        disabled: true,
      }
    }

    switch (downloadJob.status) {
      case "starting":
        return {
          icon: <Clock className="h-4 w-4 animate-spin" />,
          text: "Starting...",
          variant: "outline" as const,
          disabled: true,
        }
      case "queued":
        return {
          icon: <Clock className="h-4 w-4" />,
          text: "Queued",
          variant: "outline" as const,
          disabled: true,
        }
      case "running":
        return {
          icon: <Clock className="h-4 w-4 animate-pulse" />,
          text: "Generating...",
          variant: "outline" as const,
          disabled: true,
        }
      case "complete":
        return {
          icon: <Download className="h-4 w-4" />,
          text: "Download Ready",
          variant: "default" as const,
          disabled: false,
        }
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: "Error",
          variant: "destructive" as const,
          disabled: true,
        }
      default:
        return {
          icon: <Download className="h-4 w-4" />,
          text: "Download",
          variant: "outline" as const,
          disabled: false,
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className={`mt-3 ${className}`}>
      <div className="text-sm text-gray-600 font-medium mb-2 flex items-center">
        Data Product:
        <span className="ml-2 text-xs text-gray-500">ID: {dpRequestId}</span>
      </div>
      <Button
        variant={statusDisplay.variant}
        size="sm"
        onClick={handleButtonClick}
        disabled={statusDisplay.disabled}
        className="text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50"
      >
        {statusDisplay.icon}
        <span className="ml-2">{statusDisplay.text}</span>
      </Button>
      {downloadJob?.message && <p className="text-xs text-gray-500 mt-1">{downloadJob.message}</p>}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Download, X, CheckCircle } from "lucide-react"

interface DownloadCompletePopupProps {
  requestId: string // Changed from dpRequestId to requestId
  onDownload: () => void
  onDismiss: () => void
}

export function DownloadCompletePopup({ requestId, onDownload, onDismiss }: DownloadCompletePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Download Ready!</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">Your data product has been generated and is ready for download.</p>
          <p className="text-sm text-gray-500 mt-2">Request ID: {requestId}</p>
        </div>

        <div className="flex space-x-3">
          <Button onClick={onDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
          <Button variant="outline" onClick={onDismiss}>
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}

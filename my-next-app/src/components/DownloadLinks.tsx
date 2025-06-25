"use client"

import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

interface DownloadLinksProps {
  link: string
  className?: string
}

export function DownloadLinks({ link, className = "" }: DownloadLinksProps) {
  if (!link || link === "no" || link.trim() === "") {
    return null
  }

  const handleDownload = () => {
    // Open the link in a new tab
    window.open(link, "_blank", "noopener,noreferrer")
  }

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split("/").pop() || "Download"
      return fileName
    } catch {
      return "Download"
    }
  }

  return (
    <div className={`mt-3 ${className}`}>
      <div className="text-sm text-gray-600 font-medium mb-2">Available Download:</div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
      >
        <Download className="h-4 w-4 mr-2" />
        {getFileName(link)}
        <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
      </Button>
    </div>
  )
}

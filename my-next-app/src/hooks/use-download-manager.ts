"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { dataProductService } from "@/lib/data-product-service"

interface DownloadJob {
  requestId: string
  status: "starting" | "queued" | "running" | "complete" | "error"
  message?: string
  downloadUrl?: string
  startTime: Date
}

export function useDownloadManager() {
  const [activeDownloads, setActiveDownloads] = useState<{ [key: string]: DownloadJob }>({})
  const [completedDownloads, setCompletedDownloads] = useState<string[]>([])
  const pollIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const startDownload = useCallback(async (requestId: string) => {
    console.log(`Starting download for request_id: ${requestId}`)

    // Add to active downloads
    setActiveDownloads((prev) => ({
      ...prev,
      [requestId]: {
        requestId,
        status: "starting",
        startTime: new Date(),
      },
    }))

    try {
      // Start the download process (this is mostly just logging)
      await dataProductService.startDownloadProcess(requestId)

      // Update status to queued and start polling
      setActiveDownloads((prev) => ({
        ...prev,
        [requestId]: {
          ...prev[requestId],
          status: "queued",
        },
      }))

      // Start polling for status
      startPolling(requestId)
    } catch (error) {
      console.error(`Failed to start download for ${requestId}:`, error)
      setActiveDownloads((prev) => ({
        ...prev,
        [requestId]: {
          ...prev[requestId],
          status: "error",
          message: error instanceof Error ? error.message : "Failed to start download",
        },
      }))
    }
  }, [])

  const startPolling = useCallback((requestId: string) => {
    // Clear any existing interval
    if (pollIntervals.current[requestId]) {
      clearInterval(pollIntervals.current[requestId])
    }

    console.log(`Starting polling for request_id: ${requestId}`)

    pollIntervals.current[requestId] = setInterval(async () => {
      try {
        const status = await dataProductService.checkStatus(requestId)
        console.log(`Status update for ${requestId}:`, status)

        setActiveDownloads((prev) => {
          const current = prev[requestId]
          if (!current) return prev

          return {
            ...prev,
            [requestId]: {
              ...current,
              status: status.status,
              message: status.message,
              downloadUrl: status.downloadUrl,
            },
          }
        })

        // If complete or error, stop polling and move to completed
        if (status.status === "complete" || status.status === "error") {
          clearInterval(pollIntervals.current[requestId])
          delete pollIntervals.current[requestId]

          if (status.status === "complete") {
            setCompletedDownloads((prev) => [...prev, requestId])
          }
        }
      } catch (error) {
        console.error(`Failed to check status for ${requestId}:`, error)
        // Continue polling on error, don't stop
      }
    }, 3000) // Poll every 3 seconds (slightly faster than backend's 2 second intervals)
  }, [])

  const dismissCompleted = useCallback((requestId: string) => {
    setCompletedDownloads((prev) => prev.filter((id) => id !== requestId))
    setActiveDownloads((prev) => {
      const { [requestId]: removed, ...rest } = prev
      return rest
    })
  }, [])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollIntervals.current).forEach((interval) => {
        clearInterval(interval)
      })
    }
  }, [])

  return {
    activeDownloads,
    completedDownloads,
    startDownload,
    dismissCompleted,
  }
}

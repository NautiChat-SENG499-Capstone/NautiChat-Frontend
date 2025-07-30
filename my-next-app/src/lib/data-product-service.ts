import axios from "axios"
import { chatAPI } from "./api"
import type { ONCDataProductResponse } from "@/types/chat"

export interface DataProductStatus {
  status: "queued" | "running" | "complete" | "error"
  message?: string
  downloadUrl?: string
}

export interface DataProductRunResponse {
  success: boolean
  message?: string
}

class DataProductService {
  private oncToken: string | null = null

  // Get and cache the ONC token
  private async getONCToken(): Promise<string> {
    if (this.oncToken) {
      return this.oncToken
    }

    try {
      const userInfo = await chatAPI.getUserInfo()
      this.oncToken = userInfo.onc_token
      console.log("Retrieved ONC token from user info")
      return this.oncToken
    } catch (error) {
      console.error("Failed to get ONC token:", error)
      throw new Error("Failed to get ONC token")
    }
  }

  // Emulate the backend function: get_data_download_link
  async getDataDownloadLink(requestId: string): Promise<string> {
    try {
      console.log(`Getting data download link for request_id: ${requestId}`)

      const oncToken = await this.getONCToken()

      // Poll the Ocean Networks Canada API (up to 10 times)
      for (let attempt = 1; attempt <= 10; attempt++) {
        console.log(`Polling attempt ${attempt}/10 for request_id: ${requestId}`)

        const url = `https://data.oceannetworks.ca/api/dataProductDelivery/run?dpRequestId=${requestId}&token=${oncToken}`

        try {
          const response = await axios.get(url, { timeout: 10000 })
          console.log(`ONC API response (attempt ${attempt}):`, response.data)

          // The response should be an array with one element
          const data: ONCDataProductResponse = Array.isArray(response.data) ? response.data[0] : response.data

          if (data.status === "complete" && data.dpRunId) {
            // Request is complete, form the download link
            const runId = data.dpRunId
            const index = 1 // Currently hardcoded (will download the first file available)
            const downloadUrl = `https://data.oceannetworks.ca/api/dataProductDelivery/download?dpRunId=${runId}&index=${index}&token=${oncToken}`

            console.log(`Download link ready for request_id ${requestId}:`, downloadUrl)
            return downloadUrl
          } else {
            console.log(`Request ${requestId} not ready yet, status: ${data.status}`)
            // Wait 10 seconds before next attempt
            if (attempt < 10) {
              await new Promise((resolve) => setTimeout(resolve, 10000))
            }
          }
        } catch (apiError) {
          console.error(`ONC API error on attempt ${attempt}:`, apiError)
          if (attempt < 10) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        }
      }

      // If we get here, we've exhausted all attempts
      throw new Error(`Failed to get download link for request_id ${requestId} after 10 attempts`)
    } catch (error) {
      console.error("Failed to get data download link:", error)
      throw error
    }
  }

  // Check status of a data product request
  async checkStatus(requestId: string): Promise<DataProductStatus> {
    try {
      console.log(`Checking status for request_id: ${requestId}`)

      const oncToken = await this.getONCToken()
      const url = `https://data.oceannetworks.ca/api/dataProductDelivery/run?dpRequestId=${requestId}&token=${oncToken}`

      const response = await axios.get(url, { timeout: 10000 })
      console.log("ONC API status response:", response.data)

      // The response should be an array with one element
      const data: ONCDataProductResponse = Array.isArray(response.data) ? response.data[0] : response.data

      if (data.status === "complete" && data.dpRunId) {
        // Generate the download URL
        const runId = data.dpRunId
        const index = 1
        const downloadUrl = `https://data.oceannetworks.ca/api/dataProductDelivery/download?dpRunId=${runId}&index=${index}&token=${oncToken}`

        return {
          status: "complete",
          downloadUrl: downloadUrl,
          message: "Download ready",
        }
      } else if (data.status === "running") {
        return {
          status: "running",
          message: "Processing data product...",
        }
      } else if (data.status === "queued") {
        return {
          status: "queued",
          message: "Request queued for processing",
        }
      } else {
        return {
          status: "running",
          message: "Processing data product...",
        }
      }
    } catch (error) {
      console.error("Failed to check data product status:", error)
      return {
        status: "error",
        message: "Failed to check status",
      }
    }
  }

  // Start the download process (this just triggers the first status check)
  async startDownloadProcess(requestId: string): Promise<void> {
    try {
      console.log(`Starting download process for request_id: ${requestId}`)
      // The process is already started by the backend when it returns the request_id
      // We just need to start polling for status
      console.log(`Download process initiated for request_id ${requestId}`)
    } catch (error) {
      console.error("Failed to start download process:", error)
      throw error
    }
  }

  // Clear cached token (useful for logout or token refresh)
  clearToken(): void {
    this.oncToken = null
  }
}

export const dataProductService = new DataProductService()

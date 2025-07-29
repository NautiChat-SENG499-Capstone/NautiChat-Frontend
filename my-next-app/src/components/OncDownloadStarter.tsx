"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { dataProductService } from "@/lib/data-product-service"

interface OncApiDownloadStarterProps {
  oncApiUrl: string
}

interface DataProduct {
  dataProductCode: string
  dataProductName: string
  extension: string
}

export default function OncApiDownloadStarter({ oncApiUrl }: OncApiDownloadStarterProps) {
  const [locationCode, setLocationCode] = useState<string>("")
  const [deviceCategoryCode, setDeviceCategoryCode] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const [dataProducts, setDataProducts] = useState<DataProduct[]>([])
  const [selectedKey, setSelectedKey] = useState<string>("")
  const [selectedProductCode, setSelectedProductCode] = useState<string>("")
  const [selectedProductExtension, setSelectedProductExtension] = useState<string>("")

  const [requesting, setRequesting] = useState(false)
  const [dpRequestId, setDpRequestId] = useState<string>("")
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    try {
      const url = new URL(oncApiUrl)
      setLocationCode(url.searchParams.get("locationCode") || "")
      setDeviceCategoryCode(url.searchParams.get("deviceCategoryCode") || "")
      setToken(url.searchParams.get("token") || "")
      setDateFrom(url.searchParams.get("dateFrom") || "")
      setDateTo(url.searchParams.get("dateTo") || "")
    } catch (e) {
      setError("Invalid ONC API URL")
    }
  }, [oncApiUrl])

  useEffect(() => {
    async function fetchDataProducts() {
      if (!locationCode || !deviceCategoryCode || !token) return
      setError("")
      try {
        const response = await fetch(
          `https://data.oceannetworks.ca/api/dataProducts?locationCode=${locationCode}&deviceCategoryCode=${deviceCategoryCode}&token=${token}`,
          { headers: { accept: "application/json" } }
        )
        if (!response.ok) throw new Error(`API error: ${response.status}`)

        const products = await response.json()
        const filtered = products
          .filter((p: any) => p.dataProductCode && p.extension)
          .map((p: any) => ({
            dataProductCode: p.dataProductCode,
            dataProductName: p.dataProductName,
            extension: p.extension,
          }))

        setDataProducts(filtered)
        setSelectedKey("")
        setSelectedProductCode("")
        setSelectedProductExtension("")
        setDpRequestId("")
        setDownloadUrl("")
      } catch (e: any) {
        setError(e.message || "Failed to fetch data products")
      }
    }
    fetchDataProducts()
  }, [locationCode, deviceCategoryCode, token])

  useEffect(() => {
    if (selectedKey) {
      const [code, ext] = selectedKey.split("::")
      setSelectedProductCode(code)
      setSelectedProductExtension(ext)
    } else {
      setSelectedProductCode("")
      setSelectedProductExtension("")
    }
  }, [selectedKey])

  async function handleRequestDownload() {
    if (!selectedProductCode || !selectedProductExtension) {
      setError("Please select a data product")
      return
    }
    setError("")
    setRequesting(true)

    try {
      const url = new URL("https://data.oceannetworks.ca/api/dataProductDelivery/request")
      url.searchParams.set("locationCode", locationCode)
      url.searchParams.set("deviceCategoryCode", deviceCategoryCode)
      url.searchParams.set("dataProductCode", selectedProductCode)
      url.searchParams.set("extension", selectedProductExtension)
      if (dateFrom) url.searchParams.set("dateFrom", dateFrom)
      if (dateTo) url.searchParams.set("dateTo", dateTo)
      url.searchParams.set("token", token)

      const response = await fetch(url.toString(), { headers: { accept: "application/json" } })
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      const data = await response.json()

      if (data.dpRequestId) {
        setDpRequestId(String(data.dpRequestId))
      } else {
        throw new Error("No dpRequestId returned")
      }
    } catch (e: any) {
      setError(e.message || "Failed to request download")
    } finally {
      setRequesting(false)
    }
  }

  async function handleDownload() {
    if (!dpRequestId) return
    try {
      const link = await dataProductService.getDataDownloadLink(dpRequestId)
      setDownloadUrl(link)
      window.open(link, "_blank", "noopener,noreferrer")
    } catch (e: any) {
      setError(e.message || "Failed to get download link")
    }
  }

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setShowPanel((prev) => !prev)}>
        {showPanel ? "Hide Download Options" : "Show Download Options"}
      </Button>

      {showPanel && (
        <div className="border rounded p-3 bg-gray-50 max-w-md mt-2">
          {error && <p className="text-red-600 mb-2">{error}</p>}

          {!dpRequestId ? (
            <>
              <label className="block mb-1 font-medium" htmlFor="dataProductSelect">
                Select Data Product:
              </label>
              <select
                id="dataProductSelect"
                className="w-full mb-3 p-2 border rounded"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                disabled={requesting || dataProducts.length === 0}
              >
                <option value="">-- Choose a product --</option>
                {dataProducts.map(({ dataProductCode, dataProductName, extension }) => {
                  const key = `${dataProductCode}::${extension}`
                  return (
                    <option key={key} value={key}>
                      {dataProductName} ({extension})
                    </option>
                  )
                })}
              </select>

              <Button
                onClick={handleRequestDownload}
                disabled={requesting || !selectedProductCode || !selectedProductExtension}
                className="w-full"
              >
                {requesting ? "Requesting..." : "Request Data"}
              </Button>
            </>
          ) : (
            <Button onClick={handleDownload} className="w-full" variant="default">
              Request Download
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

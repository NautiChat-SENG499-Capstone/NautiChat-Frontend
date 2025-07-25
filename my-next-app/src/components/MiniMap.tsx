// app/components/MiniMap.tsx
"use client"

import { useEffect, useRef } from "react"

export function MiniMap() {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Ensure Leaflet runs on client
    if (typeof window === "undefined") return

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!).setView([69.1166, -105.0597], 4)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)
    })
  }, [])

  return <div ref={mapRef} className="h-40 w-full rounded-md" />
}

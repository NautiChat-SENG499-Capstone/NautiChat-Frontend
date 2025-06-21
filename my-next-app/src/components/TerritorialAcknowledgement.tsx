"use client"

import { MapPin } from "lucide-react"

export function TerritorialAcknowledgement() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mx-6 mb-4">
      <div className="flex items-center space-x-3">
        <MapPin className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-white/90 leading-relaxed">
            We acknowledge with respect that the Cambridge Bay coastal community observatory is located on the lands and
            in the waters of the Inuit, in Iqaluktuuttiaq (Cambridge Bay) in the Kitikmeot Region of Nunavut.
          </p>
        </div>
      </div>
    </div>
  )
}

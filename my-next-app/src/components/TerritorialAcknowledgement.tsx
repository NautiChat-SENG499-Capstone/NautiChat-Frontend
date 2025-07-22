"use client"

import { MapPin } from "lucide-react"

export function TerritorialAcknowledgement() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-cyan-600/30 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 mx-2 sm:mx-6"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-black mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-black/90 leading-snug sm:leading-relaxed">
              {i === 1
                ? "We acknowledge with respect that the Cambridge Bay coastal community observatory is located on the lands and in the waters of the Inuit, in Iqaluktuuttiaq (Cambridge Bay) in the Kitikmeot Region of Nunavut."
                : "We acknowledge with respect the Lekwungen peoples on whose traditional territory the University of Victoria stands, and the Songhees, Esquimalt and W̱SÁNEĆ peoples whose historical relationships with the land continue to this day."}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

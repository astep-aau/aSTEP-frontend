'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'

interface MapProps {
  center?: [number, number]
  zoom?: number
  origin?: { lat: number; lon: number } | null
  destination?: { lat: number; lon: number } | null
  routeData?: Array<[number, number]>
  onMapClick?: (lat: number, lon: number) => void
  clickable?: boolean
  className?: string
}

// Dynamically import the Map component with SSR disabled
const MapComponent = dynamic(
  () => import('./map3').then((mod) => mod.Map),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }
)

export function Map(props: MapProps) {
  return <MapComponent {...props} />
}
'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import { useTheme } from 'next-themes'
import styles from './map.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for start (green) and end (red)
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface RouteHandlerProps {
  markerMode: 'start' | 'end' | null
  onMarkerSet: (type: 'start' | 'end', position: [number, number]) => void
  adjustedStartCoord?: [number, number] | null
  adjustedEndCoord?: [number, number] | null
}

function RouteHandler({ markerMode, onMarkerSet, adjustedStartCoord, adjustedEndCoord }: RouteHandlerProps) {
  const [points, setPoints] = useState<{ start?: [number, number], end?: [number, number] }>({})
  const map = useMap()
  const markerModeRef = useRef(markerMode)
  const onMarkerSetRef = useRef(onMarkerSet)

  // Keep refs up to date
  useEffect(() => {
    markerModeRef.current = markerMode
    onMarkerSetRef.current = onMarkerSet
  }, [markerMode, onMarkerSet])

  // Set up click handler with proper cleanup
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!markerModeRef.current) return

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]

      setPoints(prev => ({ ...prev, [markerModeRef.current!]: newPoint }))
      onMarkerSetRef.current(markerModeRef.current, newPoint)
    }

    // Add event listener
    map.on('click', handleClick)

    // Cleanup function - removes the event listener
    return () => {
      map.off('click', handleClick)
    }
  }, [map]) // Only re-run if map instance changes

  // Use adjusted coordinates if available, otherwise use clicked points
  const displayStartCoord = adjustedStartCoord || points.start
  const displayEndCoord = adjustedEndCoord || points.end

  return (
    <>
      {displayStartCoord && (
        <Marker position={displayStartCoord} icon={startIcon}>
          <Popup>
            <div>
              <h3 className="font-semibold">Start Point</h3>
              {adjustedStartCoord && (
                <p className="text-xs text-gray-600 mt-1">
                  Adjusted to nearest graph node
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      )}
      {displayEndCoord && (
        <Marker position={displayEndCoord} icon={endIcon}>
          <Popup>
            <div>
              <h3 className="font-semibold">End Point</h3>
              {adjustedEndCoord && (
                <p className="text-xs text-gray-600 mt-1">
                  Adjusted to nearest graph node
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  className?: string
  markerMode: 'start' | 'end' | null
  route: [number, number][]
  onMarkerSet: (type: 'start' | 'end', position: [number, number]) => void
  adjustedStartCoord?: [number, number] | null
  adjustedEndCoord?: [number, number] | null
}

export function MapComponent({
  center = [45.755536, 126.636858],
  zoom = 13,
  className = "h-96 w-full rounded-lg",
  markerMode,
  route,
  onMarkerSet,
  adjustedStartCoord,
  adjustedEndCoord
}: MapComponentProps) {
  const { theme } = useTheme()

  return (
    <div className={`${className} ${theme === 'dark' ? styles.darkMap : ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            theme === 'dark'
              ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

        <RouteHandler
          markerMode={markerMode}
          onMarkerSet={onMarkerSet}
          adjustedStartCoord={adjustedStartCoord}
          adjustedEndCoord={adjustedEndCoord}
        />

        {route.length > 0 && (
          <Polyline
            positions={route}
            color="blue"
            weight={8}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  )
}

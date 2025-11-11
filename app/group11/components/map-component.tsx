'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
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

interface RouteHandlerProps {
  onRoute: (start: [number, number], end: [number, number]) => void
  markerMode: 'start' | 'end' | null
  onMarkerSet: (type: 'start' | 'end', position: [number, number]) => void
}

function RouteHandler({ onRoute, markerMode, onMarkerSet }: RouteHandlerProps) {
  const [points, setPoints] = useState<{ start?: [number, number], end?: [number, number] }>({})

  useMapEvents({
    click: (e) => {
      if (!markerMode) return

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]

      const updatedPoints = { ...points, [markerMode]: newPoint }
      setPoints(updatedPoints)
      onMarkerSet(markerMode, newPoint)

      // If both points are set, fetch route
      if (updatedPoints.start && updatedPoints.end) {
        onRoute(updatedPoints.start, updatedPoints.end)
      }
    },
  })

  return (
    <>
      {points.start && (
        <Marker position={points.start}>
          <Popup>
            <div>
              <h3 className="font-semibold">Start Point</h3>
            </div>
          </Popup>
        </Marker>
      )}
      {points.end && (
        <Marker position={points.end}>
          <Popup>
            <div>
              <h3 className="font-semibold">End Point</h3>
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
  onRoute: (start: [number, number], end: [number, number]) => void
  onMarkerSet: (type: 'start' | 'end', position: [number, number]) => void
}

export function MapComponent({
  center = [45.755536, 126.636858],
  zoom = 13,
  className = "h-96 w-full rounded-lg",
  markerMode,
  route,
  onRoute,
  onMarkerSet
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

        <RouteHandler onRoute={onRoute} markerMode={markerMode} onMarkerSet={onMarkerSet} />

        {route.length > 0 && (
          <Polyline
            positions={route}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  )
}

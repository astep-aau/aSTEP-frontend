'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    title: string
    description?: string
  }>
  className?: string
}

function RouteHandler({ onRoute }: { onRoute: (start: [number, number], end: [number, number]) => void }) {
  const [points, setPoints] = useState<[number, number][]>([])

  useMapEvents({
    click: (e) => {
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]
      
      if (points.length === 0) {
        setPoints([newPoint])
      } else if (points.length === 1) {
        setPoints([points[0], newPoint])
        onRoute(points[0], newPoint)
      } else {
        // Reset and start new route
        setPoints([newPoint])
      }
    },
  })

  return (
    <>
      {points.map((point, idx) => (
        <Marker key={idx} position={point}>
          <Popup>
            <div>
              <h3 className="font-semibold">{idx === 0 ? 'Start' : 'End'}</h3>
              <p>Click on map to set {points.length === 1 ? 'end point' : 'new start point'}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export function Map({ 
  center = [45.755536, 126.636858],
  zoom = 13,
  markers = [],
  className = "h-96 w-full rounded-lg"
}: MapProps) {
  const [route, setRoute] = useState<[number, number][]>([])
  const [distance, setDistance] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      )
      const data = await response.json()
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        )
        setRoute(coords)
        setDistance(data.routes[0].distance / 1000) // Convert to km
        setDuration(data.routes[0].duration / 60) // Convert to minutes
      }
    } catch (error) {
      console.error('Error fetching route:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Instructions:</strong> Click on the map to set your start point, then click again to set your end point. A route will be automatically generated.
        </p>
        {loading && <p className="text-sm text-blue-700 mt-2">Loading route...</p>}
        {distance && duration && (
          <div className="mt-2 text-sm text-blue-900">
            <strong>Route Info:</strong> Distance: {distance.toFixed(2)} km | Duration: {duration.toFixed(0)} minutes
          </div>
        )}
      </div>
      
      <div className={className}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          className="h-full w-full rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position}>
              <Popup>
                <div>
                  <h3 className="font-semibold">{marker.title}</h3>
                  {marker.description && <p>{marker.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
          
          <RouteHandler onRoute={fetchRoute} />
          
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
    </div>
  )
}

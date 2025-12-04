'use client'

/**
 * Interactive Map Component 
 * FEATURES:
 * - Custom colored markers (green for origin, red for destination)
 * - Click-to-select coordinate functionality with visual feedback
 * - Crosshair cursor and dashed border when in picker mode
 * - Automatic map bounds adjustment to fit all markers
 * - Route path visualization with blue polyline
 * - Popup information windows for each marker
 * - Mouse wheel zoom support
 */

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'

// Fix Leaflet default icon issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for origin (green) and destination (red)
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component Props
interface MapProps {
  center?: [number, number]
  zoom?: number
  origin?: { lat: number; lon: number } | null
  destination?: { lat: number; lon: number } | null
  routeData?: Array<[number, number]>
  className?: string
  onMapClick?: (lat: number, lon: number) => void
  clickable?: boolean
}

// Component to handle map clicks for coordinate picking
function MapClickHandler({ onMapClick, clickable }: { onMapClick?: (lat: number, lon: number) => void, clickable?: boolean }) {
  // Get the map instance
  const map = useMap();
  
  // Change cursor style based on clickable prop
  useEffect(() => {
    const container = map.getContainer();
    if (clickable) {
      container.style.cursor = 'crosshair';
      container.style.border = '2px dashed black';
    } else {
      container.style.cursor = '';
      container.style.border = '';
    }
  }, [clickable, map]);

  // Handle map click events
  useMapEvents({
    click: (e) => {
      if (clickable && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);

      }
    }
  });
  return null;
}

// Component to auto-fit map bounds when route changes
function MapBoundsUpdater({ origin, destination }: 
  { origin?: { lat: number; lon: number } | null, 
  destination?: { lat: number; lon: number } | null }) {
  const map = useMap()

  // Update map bounds when origin or destination changes
  useEffect(() => {
    if (origin && !destination) {
      map.setView([origin.lat, origin.lon], 13)
      return
    }
    if (destination && !origin) {
      map.setView([destination.lat, destination.lon], 13)
      return
    }
    if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lon],
        [destination.lat, destination.lon]
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [origin, destination, map])

  return null
}

// Main Map Component
export function Map({ 
  center = [45.755536, 126.636858],
  zoom = 10,
  origin,
  destination,
  routeData,
  className = "h-96 w-full rounded-lg",
  onMapClick,
  clickable = false,
}: MapProps) {
  // Render the map container with layers, markers, and polylines
  return (
    <div className="space-y-2">
      {/* Map container */}
      <div className={className}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          className="h-full w-full rounded-lg"
        >
          {/* Base tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Origin marker (green) */}
          {origin && (
            <Marker position={[origin.lat, origin.lon]} icon={originIcon}>
              <Popup>
                <div>
                  <h3 className="font-semibold">Origin</h3>
                  <p className="text-xs">({origin.lat.toFixed(4)}, {origin.lon.toFixed(4)})</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Destination marker (red) */}
          {destination && (
            <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
              <Popup>
                <div>
                  <h3 className="font-semibold">Destination</h3>
                  <p className="text-xs">({destination.lat.toFixed(4)}, {destination.lon.toFixed(4)})</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Route polyline */}
          {routeData && routeData.length > 0 && (
            <Polyline 
              positions={routeData} 
              color="blue" 
              weight={4}
              opacity={0.7}
            />
          )}

          {/* Map click handler for coordinate picking */}
          <MapClickHandler onMapClick={onMapClick} clickable={clickable} />
          
          {/* Auto-adjust map bounds to show full route */}
          <MapBoundsUpdater origin={origin} destination={destination} />
        </MapContainer>
      </div>
    </div>
  )
}

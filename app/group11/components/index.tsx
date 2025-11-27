'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { TimePickerCard } from './time-picker-card'
import { RouteInfoCard } from './route-info-card'
import { LocationPicker } from './location-picker'
import { fetchRoute as fetchRouteFromAPI, parseTimeString } from '../services/route-api'

export { ServiceExample } from './service-example'

const MapComponent = dynamic(() => import('./map-component').then(mod => ({ default: mod.MapComponent })), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg border flex items-center justify-center">Loading map...</div>
})

interface RoutePlannerProps {
  center?: [number, number]
  zoom?: number
  className?: string
}

export function RoutePlanner({
  center = [45.755536, 126.636858],
  zoom = 13,
  className = "h-96 w-full rounded-lg"
}: RoutePlannerProps) {
  const [route, setRoute] = useState<[number, number][]>([])
  const [distance, setDistance] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [markerMode, setMarkerMode] = useState<'start' | 'end' | null>(null)
  const [startAddress, setStartAddress] = useState<string>('')
  const [endAddress, setEndAddress] = useState<string>('')
  const [startCoord, setStartCoord] = useState<[number, number] | null>(null)
  const [endCoord, setEndCoord] = useState<[number, number] | null>(null)
  const [timeType, setTimeType] = useState<'departure' | 'arrival'>('departure')
  const [selectedTime, setSelectedTime] = useState<string>('')

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Only allow digits and colon
    value = value.replace(/[^\d:]/g, '')

    // Remove all colons first
    const digitsOnly = value.replace(/:/g, '')

    // Only process if we have digits
    if (digitsOnly.length === 0) {
      setSelectedTime('')
      return
    }

    // Build the formatted value
    let formatted = digitsOnly

    // Validate hours (00-23)
    if (formatted.length >= 2) {
      const hours = parseInt(formatted.slice(0, 2))
      if (hours > 23) {
        formatted = '23' + formatted.slice(2)
      }
    }

    // Auto-insert colon after 2 digits if we have more digits
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4)
    }

    // Validate minutes (00-59)
    if (formatted.length >= 5) {
      const minutes = parseInt(formatted.slice(3, 5))
      if (minutes > 59) {
        formatted = formatted.slice(0, 3) + '59'
      }
    }

    // Limit to HH:MM format (max 5 chars)
    if (formatted.length > 5) {
      formatted = formatted.slice(0, 5)
    }

    setSelectedTime(formatted)
  }

  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch (error) {
      console.error('Error fetching address:', error)
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  const handleMarkerSet = async (type: 'start' | 'end', position: [number, number]) => {
    const address = await fetchAddress(position[0], position[1])
    if (type === 'start') {
      setStartAddress(address)
      setStartCoord(position)
    } else {
      setEndAddress(address)
      setEndCoord(position)
    }
    setMarkerMode(null) // Reset mode after placing marker
  }

  // Auto-fetch route when all required parameters are set
  useEffect(() => {
    const fetchRouteAuto = async () => {
      // Check if all required parameters are set
      if (!startCoord || !endCoord || !selectedTime || selectedTime.length < 5) {
        return
      }

      setLoading(true)
      try {
        const timeConfig = parseTimeString(selectedTime)
        if (!timeConfig) {
          console.error('Invalid time format')
          setLoading(false)
          return
        }

        const timetype = timeType === 'departure' ? 'DEPARTURE' : 'ARRIVAL'

        console.log('Auto-fetching route with:', {
          start: startCoord,
          end: endCoord,
          timetype,
          time: timeConfig
        })

        const data = await fetchRouteFromAPI({
          start_coordinate: {
            lat: startCoord[0],
            lon: startCoord[1],
          },
          end_coordinate: {
            lat: endCoord[0],
            lon: endCoord[1],
          },
          timetype,
          time: timeConfig,
        })

        console.log('Route data received:', data)

        setRoute(data.linestring.coordinates)
        setDistance(data.length)
        setDuration(data.traversalTime)
      } catch (error) {
        console.error('Error fetching route:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRouteAuto()
  }, [startCoord, endCoord, selectedTime, timeType])

  return (
    <div className="space-y-4">
      {/* Time Picker and Route Info Row */}
      <div className="flex gap-4 items-stretch">
        <TimePickerCard
          timeType={timeType}
          selectedTime={selectedTime}
          onTimeTypeChange={(value) => setTimeType(value as 'departure' | 'arrival')}
          onTimeChange={handleTimeChange}
        />

        <div className="flex-1 flex">
          <RouteInfoCard
            loading={loading}
            distance={distance}
            duration={duration}
            timeType={timeType}
            selectedTime={selectedTime}
          />
        </div>
      </div>

      <LocationPicker
        markerMode={markerMode}
        startAddress={startAddress}
        endAddress={endAddress}
        onMarkerModeChange={setMarkerMode}
      />

      <MapComponent
        center={center}
        zoom={zoom}
        className={className}
        markerMode={markerMode}
        route={route}
        onMarkerSet={handleMarkerSet}
      />
    </div>
  )
}

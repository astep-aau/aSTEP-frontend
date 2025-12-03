'use client'

import { Card, CardContent } from '@/components/ui/card'

interface RouteInfoCardProps {
  loading: boolean
  distance: number | null
  duration: number | null
  timeType: 'departure' | 'arrival'
  selectedTime: string
}

export function RouteInfoCard({ loading, distance, duration, timeType, selectedTime }: RouteInfoCardProps) {
  if (loading) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 flex-1 flex items-center justify-center">
        <CardContent className="py-6 text-center">
          <p className="text-base text-blue-700 dark:text-blue-300">Loading route...</p>
        </CardContent>
      </Card>
    )
  }

  if (distance && duration && selectedTime) {
    // Calculate departure and arrival times
    const calculateTimes = () => {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      if (isNaN(hours) || isNaN(minutes)) return null

      const durationMinutes = Math.round(duration)

      if (timeType === 'departure') {
        // Given departure time, calculate arrival
        const departureDate = new Date()
        departureDate.setHours(hours, minutes, 0, 0)

        const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60000)

        return {
          departure: `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`,
          arrival: `${String(arrivalDate.getHours()).padStart(2, '0')}:${String(arrivalDate.getMinutes()).padStart(2, '0')}`
        }
      } else {
        // Given arrival time, calculate departure
        const arrivalDate = new Date()
        arrivalDate.setHours(hours, minutes, 0, 0)

        const departureDate = new Date(arrivalDate.getTime() - durationMinutes * 60000)

        return {
          departure: `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`,
          arrival: `${String(arrivalDate.getHours()).padStart(2, '0')}:${String(arrivalDate.getMinutes()).padStart(2, '0')}`
        }
      }
    }

    const times = calculateTimes()

    return (
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 flex-1 flex items-center justify-center">
        <CardContent className="py-6 text-center">
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-green-900 dark:text-green-100 space-y-2">
            <div>
              <strong>Distance:</strong> {distance.toFixed(2)} km | <strong>Duration:</strong> {duration.toFixed(0)} minutes
            </div>
            {times && (
              <div>
                <strong>Departure:</strong> {times.departure} | <strong>Arrival:</strong> {times.arrival}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex-1 flex items-center justify-center border-dashed">
      <CardContent className="py-6 text-center">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">Route info will appear here</p>
      </CardContent>
    </Card>
  )
}

// API service for the Zig backend route estimation

export interface Coordinate {
  lat: number
  lon: number
}

export interface TimeConfig {
  hour: number
  minute: number
}

export interface RouteRequest {
  start_coordinate: Coordinate
  end_coordinate: Coordinate
  timetype: 'DEPARTURE' | 'ARRIVAL'
  time: TimeConfig
}

export interface LineString {
  type: 'LineString'
  coordinates: [number, number][] // [lon, lat] format
}

export interface RouteResponse {
  linestring: LineString
  traversalTime: number
  length: number
}

export interface ErrorResponse {
  errors: Array<{
    message: string
    code: number
  }>
}

/**
 * Fetches a route via the Next.js API route (server-side)
 * @param request - The route request parameters
 * @returns The route response with linestring, traversal time, and length
 */
export async function fetchRoute(
  request: RouteRequest
): Promise<RouteResponse> {
  const response = await fetch('/api/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

/**
 * Validates the time configuration
 */
export function validateTime(hour: number, minute: number): boolean {
  return hour >= 0 && hour < 24 && minute >= 0 && minute < 60
}

/**
 * Parses a time string (HH:MM) into hour and minute components
 */
export function parseTimeString(timeString: string): TimeConfig | null {
  const parts = timeString.split(':')
  if (parts.length !== 2) return null

  const hour = parseInt(parts[0], 10)
  const minute = parseInt(parts[1], 10)

  if (isNaN(hour) || isNaN(minute) || !validateTime(hour, minute)) {
    return null
  }

  return { hour, minute }
}

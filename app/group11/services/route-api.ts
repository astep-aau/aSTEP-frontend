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

export interface AdjustedNodes {
  start_node: Coordinate
  end_node: Coordinate
}

export interface RouteResponse {
  linestring: LineString
  traversalTime: number
  length: number
  adjusted_nodes: AdjustedNodes
}

export interface ErrorResponse {
  errors: Array<{
    message: string
    code: number
  }>
}

/**
 * Fetches a route from the Zig backend API
 * @param request - The route request parameters
 * @param apiUrl - The API base URL (defaults to GROUP11_URL env variable or localhost:3000)
 * @returns The route response with linestring, traversal time, and length
 */
export async function fetchRoute(
  request: RouteRequest,
  apiUrl?: string
): Promise<RouteResponse> {
  // Use environment variable if available, otherwise fallback to parameter or default
  const baseUrl = apiUrl || process.env.NEXT_PUBLIC_GROUP11_URL || 'http://localhost:3030'

  const response = await fetch(`${baseUrl}/journey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    if (response.status === 400 || response.status === 422) {
      const error: ErrorResponse = await response.json()
      throw new Error(error.errors[0]?.message || 'Validation error')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
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

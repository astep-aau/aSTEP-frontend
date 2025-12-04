import { NextRequest, NextResponse } from 'next/server'

interface Coordinate {
  lat: number
  lon: number
}

interface TimeConfig {
  hour: number
  minute: number
}

interface RouteRequest {
  start_coordinate: Coordinate
  end_coordinate: Coordinate
  timetype: 'DEPARTURE' | 'ARRIVAL'
  time: TimeConfig
}

interface LineString {
  type: 'LineString'
  coordinates: [number, number][]
}

interface RouteResponse {
  linestring: LineString
  traversalTime: number
  length: number
}

interface ErrorResponse {
  errors: Array<{
    message: string
    code: number
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json()

    // Access server-side environment variable (not NEXT_PUBLIC_*)
    const baseUrl = process.env.GROUP11_URL || 'http://localhost:3030'

    const response = await fetch(`${baseUrl}/journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 400 || response.status === 422) {
        const error: ErrorResponse = await response.json()
        return NextResponse.json(
          { error: error.errors[0]?.message || 'Validation error' },
          { status: response.status }
        )
      }
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      )
    }

    const data: RouteResponse = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in route API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

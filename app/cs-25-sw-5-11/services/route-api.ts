// API service for the Zig backend route estimation

export const SEQUENCE_LENGTH_OFFSET = 27;

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

export async function fetchRoute(
	request: RouteRequest
): Promise<RouteResponse> {
	const response = await fetch('/api/journey', {
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

export function validateTime(hour: number, minute: number): boolean {
	return hour >= 0 && hour < 24 && minute >= 0 && minute < 60
}

function adjustTimeIfNeeded(hour: number, minute: number): TimeConfig {
	// Calculate total minutes from midnight
	const totalMinutes = hour * 60 + minute;

	// Calculate the invalid range threshold (SEQUENCE_LENGTH_OFFSET * 5 minutes)
	const invalidThreshold = SEQUENCE_LENGTH_OFFSET * 5;

	// If time is between 00:00 and threshold, adjust to threshold + 5 minutes
	if (totalMinutes >= 0 && totalMinutes <= invalidThreshold) {
		const adjustedTotalMinutes = invalidThreshold + 5;
		const adjustedHour = Math.floor(adjustedTotalMinutes / 60);
		const adjustedMinute = adjustedTotalMinutes % 60;

		return { hour: adjustedHour, minute: adjustedMinute };
	}

	// Otherwise, return the original time
	return { hour, minute };
}

export function parseTimeString(timeString: string): TimeConfig | null {
	const parts = timeString.split(':')
	if (parts.length !== 2) return null

	const hour = parseInt(parts[0], 10)
	const minute = parseInt(parts[1], 10)

	if (isNaN(hour) || isNaN(minute) || !validateTime(hour, minute)) {
		return null
	}

	// Adjust the time if it falls in the invalid range
	return adjustTimeIfNeeded(hour, minute);
}

---
title: Frontend Documentation
description: Detailed documentation for the Group 11 frontend application and backend integration
---
The Group 11 frontend is a Next.js-based web application that provides an interactive map interface for travel time estimation in Harbin, China. Users can select start and end points on a map, specify departure times, and receive optimized routes with accurate travel time predictions. The application uses a Next.js API route to proxy requests to the Elessar backend for enhanced security and flexibility.

## Overview

**Location:** `aSTEP-frontend/app/cs-25-sw-5-11`

**Framework:** Next.js 14 with React and TypeScript

**Map Library:** React-Leaflet with OpenStreetMap tiles

**Geographic Scope:** Harbin, China (45.7536°N, 126.6625°E)

## Architecture

The frontend follows a component-based architecture with clear separation of concerns:

```
app/cs-25-sw-5-11/
├── components/          # React components
│   ├── index.tsx        # RoutePlanner main component
│   ├── map-component.tsx        # Interactive map with Leaflet
│   ├── map.module.css           # Styles for dark mode map
│   ├── location-picker.tsx      # UI for selecting start/end points
│   ├── route-info-card.tsx      # Displays route information
│   ├── time-picker-card.tsx     # Time selection UI
│   └── service-example.tsx      # Example service component
├── services/            # API integration
│   └── route-api.ts     # API service for route requests
├── page.tsx             # Next.js page entry point
└── api-spec.yml         # OpenAPI specification

app/api/
└── journey/
    └── route.ts         # Next.js API route (proxy to backend)
```

## Key Components

### RoutePlanner Component

The main orchestrator component that manages application state and coordinates between child components.

**State Management:**

| State Variable | Type | Description |
|----------------|------|-------------|
| `route` | `[number, number][]` | Array of coordinate pairs forming the route LineString |
| `distance` | `number \| null` | Route distance in kilometers |
| `duration` | `number \| null` | Estimated travel time in minutes |
| `loading` | `boolean` | Loading state during API requests |
| `markerMode` | `'start' \| 'end' \| null` | Current marker placement mode |
| `startCoord` | `[number, number] \| null` | Displayed start coordinate (adjusted after API response) |
| `endCoord` | `[number, number] \| null` | Displayed end coordinate (adjusted after API response) |
| `userStartCoord` | `[number, number] \| null` | User-clicked start coordinate (triggers API call) |
| `userEndCoord` | `[number, number] \| null` | User-clicked end coordinate (triggers API call) |
| `startAddress` | `string` | Human-readable address for start location |
| `endAddress` | `string` | Human-readable address for end location |
| `timeType` | `'departure' \| 'arrival'` | Whether time represents departure or arrival |
| `selectedTime` | `string` | Time in HH:MM format |

**Key Features:**

- **Auto-fetch routing:** Automatically requests route when all parameters are set (triggered by `useEffect` watching `userStartCoord`, `userEndCoord`, `selectedTime`, and `timeType`)
- **Dual coordinate tracking:** Separates user-clicked coordinates (`userStartCoord`, `userEndCoord`) from display coordinates (`startCoord`, `endCoord`) to prevent race conditions
- **Coordinate adjustment handling:** Updates displayed coordinates to backend-adjusted positions from route endpoints
- **Address geocoding:** Fetches human-readable addresses using Nominatim (OpenStreetMap)
- **Time validation:** Ensures valid 24-hour time format (HH:MM) with real-time input validation

### MapComponent

Interactive map component built with React-Leaflet that handles user interactions and route visualization.

**Props:**

```typescript
interface MapComponentProps {
  center?: [number, number]           // Map center (default: Harbin)
  zoom?: number                       // Zoom level (default: 13)
  className?: string                  // CSS classes
  markerMode: 'start' | 'end' | null // Active marker placement mode
  route: [number, number][]           // Route coordinates to display
  onMarkerSet: (type, position) => void // Callback when marker placed
  clientStartCoord?: [number, number] | null    // User-clicked start coordinate
  clientEndCoord?: [number, number] | null      // User-clicked end coordinate
  adjustedStartCoord?: [number, number] | null  // Backend-adjusted start
  adjustedEndCoord?: [number, number] | null    // Backend-adjusted end
}
```

**Features:**

- **Click-to-place markers:** Users click on the map to set start/end points
- **Route visualization:** Renders LineString as a blue polyline
- **Coordinate adjustment display:** Shows adjusted coordinates from backend
- **Dark mode support:** Switches to dark map tiles in dark mode
- **Marker popups:** Displays "Adjusted to nearest graph node" for adjusted coordinates

### Route Visualization

The route is rendered using React-Leaflet's `Polyline` component:

```typescript
<Polyline
  positions={route}      // Array of [lat, lon] coordinates
  color="blue"           // Route line color
  weight={5}             // Line width in pixels (5 pixels)
  opacity={0.7}          // Line transparency
/>
```

The `route` array contains all waypoints returned by the backend API, creating a continuous line along the road network from start to end.

### RouteInfoCard Component

Displays route information and calculated travel times.

**Props:**

```typescript
interface RouteInfoCardProps {
  loading: boolean
  distance: number | null      // in km
  duration: number | null      // in minutes
  timeType: 'departure' | 'arrival'
  selectedTime: string         // HH:MM format
}
```

**Features:**

- **Loading State:** Shows "Loading route..." while fetching
- **Empty State:** Shows placeholder text when no route is available
- **Route Info Display:** Shows distance, duration, and calculated times
  - For departure time: Calculates and displays arrival time
  - For arrival time: Would calculate required departure time (currently disabled)
- **Time Calculations:** Adds duration to departure time to show estimated arrival

**Example Display:**

```
Distance: 6.90 km | Duration: 14 minutes
Departure: 14:30 | Arrival: 14:44
```

### TimePickerCard and LocationPicker Components

**TimePickerCard** provides a tabbed interface for selecting time type (departure/arrival) and entering the time. The arrival tab is currently disabled.

**LocationPicker** provides buttons and input fields for selecting start and end points on the map. Displays geocoded addresses for selected locations.

## Backend Integration

### Architecture Overview

The frontend uses a **two-layer architecture** for backend communication:

1. **Client-side service** (`route-api.ts`) - Sends requests to the Next.js API route
2. **Next.js API route** (`app/api/journey/route.ts`) - Proxies requests to the Elessar backend

This proxy pattern keeps the backend URL server-side and provides additional security and flexibility.

### API Service (`route-api.ts`)

The frontend communicates with the backend through the Next.js API route at `/api/journey`:

```typescript
export async function fetchRoute(request: RouteRequest): Promise<RouteResponse> {
  const response = await fetch('/api/journey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  // ... error handling and response parsing
}
```

### Next.js API Route (`app/api/journey/route.ts`)

The API route proxies requests to the Elessar backend:

```typescript
export async function POST(request: NextRequest) {
  const body: RouteRequest = await request.json()

  // Server-side environment variable (not NEXT_PUBLIC_*)
  const baseUrl = process.env.GROUP11_URL || 'http://localhost:3030'

  const response = await fetch(`${baseUrl}/journey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  // ... error handling and response forwarding
}
```

**Configuration:**

The backend URL is configured via the `GROUP11_URL` environment variable (server-side only, not `NEXT_PUBLIC_*`). It defaults to `http://localhost:3030` if not set.

### Request Format

**TypeScript Interface:**

```typescript
interface RouteRequest {
  start_coordinate: {
    lat: number
    lon: number
  }
  end_coordinate: {
    lat: number
    lon: number
  }
  timetype: 'DEPARTURE' | 'ARRIVAL'
  time: {
    hour: number    // 0-23
    minute: number  // 0-59
  }
}
```

**Example Request:**

```typescript
const request = {
  start_coordinate: {
    lat: 45.755536,
    lon: 126.636858
  },
  end_coordinate: {
    lat: 45.760000,
    lon: 126.650000
  },
  timetype: 'DEPARTURE',
  time: {
    hour: 14,
    minute: 30
  }
}

const response = await fetchRoute(request)
```

### Response Format

**TypeScript Interface:**

```typescript
interface RouteResponse {
  linestring: {
    type: 'LineString'
    coordinates: [number, number][]  // [lat, lon] pairs
  }
  traversalTime: number  // Travel time in minutes
  length: number         // Distance in kilometers
}
```

**Example Response:**

```json
{
  "linestring": {
    "type": "LineString",
    "coordinates": [
      [45.755536, 126.636858],
      [45.756123, 126.638456],
      [45.757890, 126.642345],
      [45.760000, 126.650000]
    ]
  },
  "traversalTime": 14,
  "length": 6.9
}
```

### Data Flow Diagram

```
User Interaction
     ↓
1. User clicks on map to set start point
   → Frontend captures coordinates (e.g., 45.755, 126.637)
   → Stored in startCoord state

2. User clicks on map to set end point
   → Frontend captures coordinates (e.g., 45.760, 126.650)
   → Stored in endCoord state

3. User sets departure time (e.g., "14:30")
   → Stored in selectedTime state

4. Auto-fetch triggered (useEffect)
   ↓
5. Frontend sends POST request to Next.js API route at /api/journey
   {
     "start_coordinate": {"lat": 45.755, "lon": 126.637},
     "end_coordinate": {"lat": 45.760, "lon": 126.650},
     "timetype": "DEPARTURE",
     "time": {"hour": 14, "minute": 30}
   }
   ↓
6. Next.js API route proxies request to Elessar backend at GROUP11_URL/journey
   ↓
7. Backend processes request
   → Snaps coordinates to nearest graph nodes
   → Runs A* pathfinding algorithm
   → Predicts travel times with LSTM model
   → Constructs route LineString
   ↓
8. Backend returns adjusted route to Next.js API route
   {
     "linestring": {
       "type": "LineString",
       "coordinates": [
         [45.755123, 126.636901],  ← ADJUSTED start (nearest node)
         [45.756456, 126.638234],
         [45.757890, 126.642345],
         [45.759876, 126.649987]   ← ADJUSTED end (nearest node)
       ]
     },
     "traversalTime": 14,
     "length": 6.9
   }
   ↓
9. Next.js API route forwards response to frontend
   ↓
10. Frontend updates UI
   → route = linestring.coordinates
   → Start marker moved to route[0] (adjusted position)
   → End marker moved to route[length-1] (adjusted position)
   → Polyline drawn connecting all coordinates
   → Travel time displayed: "14 minutes"
```

## Coordinate Adjustment System

One of the most important features of the system is the **coordinate adjustment mechanism**, which ensures that user-selected points always map to valid road network nodes.

### Why Coordinate Adjustment is Necessary

The backend operates on a discrete road network graph with specific nodes (intersections) and edges (road segments). Users may click anywhere on the map, but routes can only be calculated between actual graph nodes within the Harbin dataset.

### How Adjustment Works

#### 1. User Selection Phase

When a user clicks on the map, the frontend captures the exact coordinates:

```typescript
// User clicks somewhere in Harbin
const clickedCoord = [45.755000, 126.637000]  // Arbitrary point
setStartCoord(clickedCoord)
```

#### 2. Backend Adjustment Phase

The backend receives the user's coordinates and finds the nearest graph node:

```zig
// From endpoints.zig
const startNodeId = try adjustNode.findClosestNode(
    allocator,
    parsedBody.start_coordinate.lon,
    parsedBody.start_coordinate.lat
);
```

The `findClosestNode` function searches through all vertices in the Harbin road network and returns the ID of the closest node. This ensures that:

- The coordinate maps to an actual road intersection
- The node is within the Harbin dataset boundaries
- A valid path can be calculated from this node

#### 3. Frontend Update Phase

When the route response arrives, the frontend extracts the adjusted coordinates:

```typescript
// From index.tsx (lines 157-168)
if (data.linestring.coordinates.length > 0) {
  // First coordinate in LineString = adjusted start position
  const routeStart = data.linestring.coordinates[0]

  // Last coordinate in LineString = adjusted end position
  const routeEnd = data.linestring.coordinates[data.linestring.coordinates.length - 1]

  // Fetch and update addresses for the adjusted positions
  const adjustedStartAddress = await fetchAddress(routeStart[0], routeStart[1])
  const adjustedEndAddress = await fetchAddress(routeEnd[0], routeEnd[1])

  // Update displayed addresses
  setStartAddress(adjustedStartAddress)
  setEndAddress(adjustedEndAddress)
}
```

#### 4. Visual Feedback

The map component displays markers at the adjusted positions with helpful popups:

```typescript
{adjustedStartCoord && (
  <p className="text-xs text-gray-600 mt-1">
    Adjusted to nearest graph node
  </p>
)}
```

### Visual Example

```
User clicks here:
   ⊗ (45.755000, 126.637000)
   |
   | Stored in userStartCoord (triggers API call)
   | Immediately displayed at startCoord
   ↓
Backend finds nearest node
   ↓
Marker updates to adjusted position:
   ● (45.755123, 126.636901) ← Actual graph node (from route[0])
   |
   | Stored in startCoord (display only)

Route starts from adjusted position
```

### Implementation: Dual Coordinate State

The frontend uses a dual coordinate state system to handle the asynchronous nature of coordinate adjustment:

**User Coordinates (`userStartCoord`, `userEndCoord`):**
- Set immediately when user clicks the map
- Used as the source of truth for API requests
- Triggers the `useEffect` to fetch routes

**Display Coordinates (`startCoord`, `endCoord`):**
- Initially set to user-clicked position for immediate visual feedback
- Updated to adjusted positions when route response arrives
- Used for marker positioning on the map

This separation prevents:
- **Race conditions:** New marker clicks don't interfere with pending route responses
- **Flickering:** Markers appear immediately, then smoothly move to adjusted positions
- **Re-fetch loops:** Route fetching is triggered only by user coordinate changes, not display updates

### Benefits of This Approach

1. **Guaranteed Valid Routes:** Every route request can be successfully processed
2. **Geographic Accuracy:** Routes follow actual road network topology
3. **User-Friendly:** Users don't need to know where graph nodes are located
4. **Harbin Boundary Enforcement:** Any click in Harbin maps to a valid node
5. **Visual Feedback:** Users can see where their selected point was adjusted to

## Map Rendering and LineString Visualization

### LineString Format

The backend returns routes in **GeoJSON LineString** format, which is a standard format for representing linear geographic features.

**Structure:**

```json
{
  "type": "LineString",
  "coordinates": [
    [lat1, lon1],
    [lat2, lon2],
    [lat3, lon3],
    ...
  ]
}
```

Each coordinate pair represents a waypoint along the route, typically at:
- Road intersections (graph nodes)
- Route decision points
- Path junctions

### Rendering Process

**1. Receive LineString from API:**

```typescript
const data = await fetchRouteFromAPI(request)
// data.linestring.coordinates = [[45.755, 126.637], [45.756, 126.638], ...]
```

**2. Update State:**

```typescript
setRoute(data.linestring.coordinates)
```

**3. Pass to MapComponent:**

```typescript
<MapComponent
  route={route}  // Array of [lat, lon] pairs
  adjustedStartCoord={route[0]}
  adjustedEndCoord={route[route.length - 1]}
/>
```

**4. Render with Polyline:**

```typescript
{route.length > 0 && (
  <Polyline
    positions={route}      // Leaflet draws line through all points
    color="blue"           // Blue route line
    weight={8}             // 8 pixels wide
    opacity={0.7}          // 70% opaque
  />
)}
```

### Polyline Behavior

React-Leaflet's `Polyline` component:
- Automatically connects all coordinate pairs with straight lines
- Interpolates smoothly between points
- Follows the Mercator projection for proper geographic rendering
- Updates reactively when the `positions` prop changes

### Complete Route Visualization

A complete route visualization includes:

1. **Start Marker** (🟢 green pin) - At `route[0]` (adjusted start)
2. **Route Line** (━━━ blue line) - Connecting all waypoints
3. **End Marker** (🔴 red pin) - At `route[route.length - 1]` (adjusted end)

```
    Start Marker (adjusted)
         ●
         |
         |━━━━━━━━┐
         |        |
         |        ┃  Blue Polyline
         |        |  (route linestring)
         ┃        |
         └━━━━━━━━●
              End Marker (adjusted)
```

## Harbin Dataset Geographic Scope

### Map Configuration

The application is configured for Harbin, China:

```typescript
// Default map center: Central Harbin
center = [45.755536, 126.636858]
zoom = 13  // City-level view
```

### Dataset Boundaries

The backend road network graph contains nodes and edges exclusively within Harbin's boundaries. This means:

- **All graph nodes** are located in Harbin
- **All edges** connect nodes within Harbin
- **Coordinate adjustment** always finds a node in Harbin
- **Users can click anywhere** on the visible map, and the backend will snap to the nearest Harbin node

### Why Geographic Scoping Matters

1. **Data Integrity:** Travel time predictions are trained on Harbin traffic data
2. **Model Accuracy:** LSTM model is optimized for Harbin's road network patterns
3. **Computational Efficiency:** Smaller geographic scope = faster pathfinding
4. **User Experience:** Users get accurate results for Harbin-specific travel

### Handling Out-of-Bounds Clicks

If a user somehow clicks outside Harbin (e.g., by panning the map):

1. Frontend sends the coordinate to backend
2. Backend's `findClosestNode` searches all vertices
3. Returns the closest node in the dataset (which is in Harbin)
4. Frontend displays the adjusted marker in Harbin
5. Route is calculated within Harbin boundaries

This ensures the system always returns valid results, even for edge cases.

## Time Selection and Validation

### Time Input Format

Users enter time in **24-hour format** (HH:MM):

```
Valid examples:
  - 00:00 (midnight)
  - 08:30 (8:30 AM)
  - 14:45 (2:45 PM)
  - 23:59 (11:59 PM)

Invalid examples:
  - 24:00 (hours must be 0-23)
  - 12:60 (minutes must be 0-59)
  - 8:30  (missing leading zero)
```

### Time Validation Logic

**Frontend validation:**

```typescript
// From index.tsx (lines 58-77)
// Validates hours (00-23)
if (formatted.length >= 2) {
  const hours = parseInt(formatted.slice(0, 2))
  if (hours > 23) {
    formatted = '23' + formatted.slice(2)  // Cap at 23
  }
}

// Validates minutes (00-59)
if (formatted.length >= 5) {
  const minutes = parseInt(formatted.slice(3, 5))
  if (minutes > 59) {
    formatted = formatted.slice(0, 3) + '59'  // Cap at 59
  }
}
```

**Backend validation:**

```zig
// From types.zig (lines 6-8)
pub fn isValidTime(self: Time) bool {
    return self.hour < 24 and self.minute < 60;
}
```

### Time Type: Departure vs. Arrival

Users can specify whether the entered time represents:

- **DEPARTURE:** "I want to leave at 14:30"
  - System calculates estimated arrival time based on predicted travel time
  - Default and currently active option
  - UI displays both departure and calculated arrival time

- **ARRIVAL:** "I want to arrive by 18:00"
  - Would calculate when to depart to arrive at the specified time
  - UI tab exists but is currently disabled
  - Backend API accepts this parameter but frontend has not fully enabled it

### Time and Travel Time Predictions

The selected time affects route calculation because:

1. **Traffic Patterns Vary:** Traffic conditions differ by time of day
2. **LSTM Model Input:** The time determines which historical data window is used
3. **Prediction Accuracy:** Predicting for rush hour vs. off-peak produces different results

Example: A route at 08:00 (rush hour) may take 30 minutes, but the same route at 14:00 (off-peak) may take only 20 minutes.

## User Workflow

### Complete User Journey

**Step 1: Open Application**
- Map loads centered on Harbin
- Default zoom level shows city-wide view
- No markers or routes displayed initially

**Step 2: Set Start Point**
- User clicks "Select Start Point" button
- Map enters "start marker mode"
- User clicks anywhere on the map
- Frontend captures coordinates
- Stores in `startCoord` state

**Step 3: Set End Point**
- User clicks "Select End Point" button
- Map enters "end marker mode"
- User clicks destination on map
- Frontend captures coordinates
- Stores in `endCoord` state

**Step 4: Set Departure Time**
- User enters time (e.g., "14:30")
- Time is validated in real-time
- Stores in `selectedTime` state

**Step 5: Automatic Route Fetch**
- `useEffect` detects all parameters are set
- Triggers `fetchRouteAuto()` function
- Loading state displayed

**Step 6: Backend Processing**
- Request sent to `POST /journey`
- Backend adjusts coordinates to graph nodes
- A* algorithm finds optimal path
- LSTM model predicts travel times
- Response returned with LineString

**Step 7: Route Display**
- Frontend receives response
- Markers move to adjusted positions (first/last LineString points)
- Blue polyline drawn along route
- Route info card displays:
  - Distance in km (e.g., "6.9 km")
  - Duration in minutes (e.g., "14 minutes")
  - Calculated departure and arrival times (e.g., "Departure: 14:30 | Arrival: 14:44")
- Addresses updated with adjusted locations

**Step 8: User Interaction**
- User can hover over markers for details
- Click route line for information
- Modify time to see updated predictions
- Select new start/end points to plan different route

## Error Handling

### Frontend Error Handling

**Network Errors:**

```typescript
try {
  const data = await fetchRouteFromAPI(request)
  // Process response...
} catch (error) {
  console.error('Error fetching route:', error)
  // User sees loading state ends but no route displayed
}
```

**Validation Errors:**

```typescript
if (!timeConfig) {
  console.error('Invalid time format')
  setLoading(false)
  return
}
```

**API Errors:**

```typescript
if (!response.ok) {
  if (response.status === 400 || response.status === 422) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.errors[0]?.message || 'Validation error')
  }
  throw new Error(`HTTP error! status: ${response.status}`)
}
```

### User-Facing Error States

| Error Condition | User Experience |
|----------------|-----------------|
| Network failure | Loading spinner stops, no route displayed |
| Invalid time format | Time input clamped to valid range |
| Missing coordinates | Route fetch not triggered |
| Backend error 500 | Loading stops, console error logged |
| Invalid JSON response | Error thrown, caught by try-catch |

**Future Enhancement:** Display user-friendly error messages instead of silent failures.

## Performance Considerations

### Frontend Optimizations

1. **Dynamic Imports:** Map component loaded dynamically to reduce initial bundle size
   ```typescript
   const MapComponent = dynamic(() => import('./map-component'), {
     ssr: false,  // Disable server-side rendering for Leaflet
   })
   ```

2. **Auto-fetch with useEffect:** Prevents redundant API calls
   ```typescript
   useEffect(() => {
     // Only fetch when ALL required parameters are set
     if (!startCoord || !endCoord || !selectedTime) return
     fetchRouteAuto()
   }, [startCoord, endCoord, selectedTime, timeType])
   ```

3. **State Management:** Efficient React state updates minimize re-renders

4. **Event Cleanup:** Proper cleanup of Leaflet event listeners
   ```typescript
   return () => {
     map.off('click', handleClick)  // Prevent memory leaks
   }
   ```

### Rendering Performance

- **Polyline Optimization:** Leaflet efficiently renders LineStrings with hundreds of points
- **Marker Reuse:** Markers updated in place rather than recreated
- **Conditional Rendering:** Route only rendered when `route.length > 0`

## Environment Configuration

### Environment Variables

```bash
# .env.local or deployment environment
# Server-side only (used by Next.js API route)
GROUP11_URL=http://your-backend-url:3030
```

**Important:** Use `GROUP11_URL` (not `NEXT_PUBLIC_GROUP11_URL`) since the API route runs server-side. The environment variable is accessed in `app/api/journey/route.ts` and defaults to `http://localhost:3030` if not set.

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Application runs on http://localhost:3000
# Access Group 11 page at http://localhost:3000/cs-25-sw-5-11
```

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with SSR | 14+ |
| **React** | UI component library | 18+ |
| **TypeScript** | Type-safe JavaScript | 5+ |
| **React-Leaflet** | Map component library | Latest |
| **Leaflet** | Interactive map rendering | 1.9+ |
| **OpenStreetMap** | Map tile provider | - |
| **Nominatim** | Reverse geocoding | - |
| **Tailwind CSS** | Utility-first CSS | 3+ |

## Future Enhancements

Potential improvements for the frontend include:

1. **Error Messages:** Display user-friendly error notifications
2. **Loading States:** More detailed loading indicators during route calculation
3. **Route Alternatives:** Show multiple route options
4. **Intermediate Waypoints:** Support for multi-stop routes
5. **Route Statistics:** Display distance, estimated fuel cost, etc.
6. **Export Functionality:** Save routes as GPX or share via link
7. **Historical Routes:** Save and reload previous route searches
8. **Accessibility:** Improve keyboard navigation and screen reader support
9. **Mobile Optimization:** Enhanced touch interactions for mobile devices
10. **Offline Support:** Cache map tiles and previously calculated routes

## Debugging Tips

### Common Issues and Solutions

**Issue: Route not displaying**
- Check browser console for errors
- Verify backend is running and accessible (check GROUP11_URL environment variable)
- Verify Next.js API route is working (check `/api/journey` endpoint)
- Confirm coordinates are within Harbin bounds
- Ensure time format is valid (HH:MM)

**Issue: Markers not moving to adjusted positions**
- Check that `route.length > 0`
- Verify `adjustedStartCoord` and `adjustedEndCoord` props are set
- Confirm LineString coordinates are in [lat, lon] format

**Issue: Map tiles not loading**
- Check internet connection (tiles loaded from CDN)
- Verify no CORS issues in browser console
- Try switching to dark mode to test alternative tile server

### Development Tools

**React DevTools:** Inspect component state and props
```bash
# Install React DevTools browser extension
# Inspect RoutePlanner component state
```

**Network Tab:** Monitor API requests/responses
```bash
# Open browser DevTools (F12)
# Go to Network tab
# Filter by "journey" to see API calls to /api/journey
# Inspect request/response payloads
# Note: Frontend calls /api/journey, which then proxies to backend
```

**Console Logging:** The application logs useful debug information
```typescript
console.log('Auto-fetching route with:', { start, end, timetype, time })
console.log('Route data received:', data)
```

## API Integration Summary

### Request/Response Flow

```typescript
// 1. Frontend prepares request (route-api.ts)
const request = {
  start_coordinate: { lat: 45.755, lon: 126.637 },
  end_coordinate: { lat: 45.760, lon: 126.650 },
  timetype: 'DEPARTURE',
  time: { hour: 14, minute: 30 }
}

// 2. Send to Next.js API route
const response = await fetch('/api/journey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
})

// 3. Next.js API route proxies to backend (app/api/journey/route.ts)
const baseUrl = process.env.GROUP11_URL || 'http://localhost:3030'
const backendResponse = await fetch(`${baseUrl}/journey`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
})

// 4. Parse response from Next.js API route
const data = await response.json()
// {
//   linestring: {
//     type: "LineString",
//     coordinates: [[lat1,lon1], [lat2,lon2], ...]
//   },
//   traversalTime: 14,  // minutes
//   length: 6.9         // km
// }

// 5. Update UI
setRoute(data.linestring.coordinates)  // Draw polyline
setDuration(data.traversalTime)        // Show travel time
setDistance(data.length)               // Show distance
setStartCoord(data.linestring.coordinates[0])      // Adjusted start
setEndCoord(data.linestring.coordinates[n-1])      // Adjusted end
```

### Key Takeaways

1. **Two-Layer Architecture:** Frontend calls Next.js API route which proxies to Elessar backend
2. **Server-Side Configuration:** Backend URL is kept server-side for security
3. **Coordinate Adjustment is Automatic:** Backend always returns adjusted coordinates as first/last LineString points
4. **LineString is Ready to Render:** Can be directly passed to Leaflet's Polyline component
5. **No Additional Processing Needed:** Response format is optimized for immediate visualization
6. **Harbin-Scoped:** All returned coordinates are guaranteed to be within Harbin's road network
7. **Units:** Distance displayed in km, duration displayed in minutes in the UI

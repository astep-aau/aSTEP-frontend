---
title: Frontend Documentation
description: Detailed documentation for the Group 11 frontend application and backend integration
---

# Frontend Documentation

The Group 11 frontend is a Next.js-based web application that provides an interactive map interface for travel time estimation in Harbin, China. Users can select start and end points on a map, specify departure or arrival times, and receive optimized routes with accurate travel time predictions.

## Overview

**Location:** `aSTEP-frontend/app/group11`

**Framework:** Next.js 14 with React and TypeScript

**Map Library:** React-Leaflet with OpenStreetMap tiles

**Geographic Scope:** Harbin, China (45.7536°N, 126.6625°E)

## Architecture

The frontend follows a component-based architecture with clear separation of concerns:

```
app/group11/
├── components/          # React components
│   ├── index.tsx        # RoutePlanner main component
│   ├── map-component.tsx        # Interactive map with Leaflet
│   ├── location-picker.tsx      # UI for selecting start/end points
│   ├── route-info-card.tsx      # Displays route information
│   └── time-picker-card.tsx     # Time selection UI
├── services/            # API integration
│   └── route-api.ts     # Backend API communication
├── page.tsx             # Next.js page entry point
└── api-spec.yml         # OpenAPI specification
```

## Key Components

### RoutePlanner Component

The main orchestrator component that manages application state and coordinates between child components.

**State Management:**

| State Variable | Type | Description |
|----------------|------|-------------|
| `route` | `[number, number][]` | Array of coordinate pairs forming the route LineString |
| `distance` | `number \| null` | Route distance in meters |
| `duration` | `number \| null` | Estimated travel time in seconds |
| `loading` | `boolean` | Loading state during API requests |
| `markerMode` | `'start' \| 'end' \| null` | Current marker placement mode |
| `startCoord` | `[number, number] \| null` | User-selected start coordinate |
| `endCoord` | `[number, number] \| null` | User-selected end coordinate |
| `timeType` | `'departure' \| 'arrival'` | Whether time represents departure or arrival |
| `selectedTime` | `string` | Time in HH:MM format |

**Key Features:**

- **Auto-fetch routing:** Automatically requests route when all parameters are set
- **Coordinate adjustment handling:** Updates displayed coordinates based on backend-adjusted positions
- **Address geocoding:** Fetches human-readable addresses using Nominatim (OpenStreetMap)
- **Time validation:** Ensures valid 24-hour time format (HH:MM)

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
  weight={8}             // Line width in pixels
  opacity={0.7}          // Line transparency
/>
```

The `route` array contains all waypoints returned by the backend API, creating a continuous line along the road network from start to end.

## Backend Integration

### API Service (`route-api.ts`)

The frontend communicates with the Elessar backend API through a dedicated service module.

**Base Configuration:**

```typescript
const baseUrl = process.env.NEXT_PUBLIC_GROUP11_URL || 'http://localhost:3030'
```

The API URL can be configured via environment variable or defaults to localhost.

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
  traversalTime: number  // Seconds
  length: number         // Meters
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
  "traversalTime": 840.5,
  "length": 69
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
5. Frontend sends POST request to backend
   {
     "start_coordinate": {"lat": 45.755, "lon": 126.637},
     "end_coordinate": {"lat": 45.760, "lon": 126.650},
     "timetype": "DEPARTURE",
     "time": {"hour": 14, "minute": 30}
   }
   ↓
6. Backend processes request
   → Snaps coordinates to nearest graph nodes
   → Runs A* pathfinding algorithm
   → Predicts travel times with LSTM model
   → Constructs route LineString
   ↓
7. Backend returns adjusted route
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
     "traversalTime": 840.5,
     "length": 69
   }
   ↓
8. Frontend updates UI
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
   | Backend finds nearest node
   ↓
Marker moves here:
   ● (45.755123, 126.636901) ← Actual graph node

Route starts from adjusted position
```

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

1. **Start Marker** (🔴 red pin) - At `route[0]` (adjusted start)
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
  - System calculates estimated arrival time
  - Default option

- **ARRIVAL:** "I want to arrive by 18:00"
  - System calculates when to depart
  - Currently accepted but may not be fully implemented

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
- Travel time displayed (e.g., "14 minutes")
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
NEXT_PUBLIC_GROUP11_URL=http://your-backend-url:3030
```

If not set, defaults to `http://localhost:3030`

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Application runs on http://localhost:3000
# Access Group 11 page at http://localhost:3000/group11
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
- Verify backend is running on port 3030
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
# Filter by "journey" to see API calls
# Inspect request/response payloads
```

**Console Logging:** The application logs useful debug information
```typescript
console.log('Auto-fetching route with:', { start, end, timetype, time })
console.log('Route data received:', data)
```

## API Integration Summary

### Request/Response Flow

```typescript
// 1. Frontend prepares request
const request = {
  start_coordinate: { lat: 45.755, lon: 126.637 },
  end_coordinate: { lat: 45.760, lon: 126.650 },
  timetype: 'DEPARTURE',
  time: { hour: 14, minute: 30 }
}

// 2. Send to backend
const response = await fetch('http://localhost:3030/journey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
})

// 3. Parse response
const data = await response.json()
// {
//   linestring: {
//     type: "LineString",
//     coordinates: [[lat1,lon1], [lat2,lon2], ...]
//   },
//   traversalTime: 840.5,
//   length: 69
// }

// 4. Update UI
setRoute(data.linestring.coordinates)  // Draw polyline
setDuration(data.traversalTime)        // Show travel time
setStartCoord(data.linestring.coordinates[0])      // Adjusted start
setEndCoord(data.linestring.coordinates[n-1])      // Adjusted end
```

### Key Takeaways

1. **Coordinate Adjustment is Automatic:** Backend always returns adjusted coordinates as first/last LineString points
2. **LineString is Ready to Render:** Can be directly passed to Leaflet's Polyline component
3. **No Additional Processing Needed:** Response format is optimized for immediate visualization
4. **Harbin-Scoped:** All returned coordinates are guaranteed to be within Harbin's road network

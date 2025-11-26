---
title: Frontend Overview
description: Frontend documentation
---

## Purpose
The purpose of the shared trajectory group frontend is to provide a baseline for the frontend that will be developed by each individual group. It was developed by group 3 but mutually agreed upon. Each individual group will have their own frontend implementation developed based on this, including their own backend communication logic.

The shared frontend provides an intuitive user interface for travel time estimation in Harbin, China. The application allows users to input origin and destination coordinates, select a departure time, choose a model version, and view estimated travel time and distance along with a visual route on an interactive map. The frontend handles input validation, real-time feedback, and data visualization as a baseline that each group can extend.
The purpose of the shared trajectory group frontend is to provide a baseline for the frontend that will be developed by each individual group. It was developed by group 3 but mutually agreed upon. Each individual group will have their own frontend implementation developed based on this, including their own backend communication logic.

The shared frontend provides an intuitive user interface for travel time estimation in Harbin, China. The application allows users to input origin and destination coordinates, select a departure time, choose a model version, and view estimated travel time and distance along with a visual route on an interactive map. The frontend handles input validation, real-time feedback, and data visualization as a baseline that each group can extend.

## Explanation
The frontend is built with Next.js 14, React, TypeScript, and Leaflet for map visualization. It follows a component-based architecture where the main page component (`page.tsx`) orchestrates state management and business logic, while specialized child components handle specific concerns like input forms, map visualization, and results display.
The frontend is built with Next.js 14, React, TypeScript, and Leaflet for map visualization. It follows a component-based architecture where the main page component (`page.tsx`) orchestrates state management and business logic, while specialized child components handle specific concerns like input forms, map visualization, and results display.

## Architecture Overview
The frontend consists of the following key components:

- **page.tsx**: Main coordinator component managing all application state and business logic
- **inputPanel.tsx**: Form component handling user input with validation and sanitization
- **visualPanel.tsx**: Container managing map display and help modal
- **dynamicMap3.tsx**: Dynamic import wrapper for the Leaflet map component (SSR compatibility)
- **map3.tsx**: Interactive Leaflet map with markers, routes, and click-to-select functionality
- **display.tsx**: Results display component showing travel time and distance
- **iconButton.tsx**: Reusable icon button component

## Data Flow Overview

1. **User Input**: User enters coordinates, time, and model version in the InputPanel
2. **Validation**: Frontend validates inputs (format, required fields)
3. **Backend Communication**: Each group implements their own backend communication logic
4. **Visualization**: Display results and render route on map
3. **Backend Communication**: Each group implements their own backend communication logic
4. **Visualization**: Display results and render route on map

## State Management

The main page component manages several state categories:

### Input State
```typescript
const [origin, setOrigin] = useState('');
const [destination, setDestination] = useState('');
const [timeOfTravel, setTimeOfTravel] = useState('');
const [modelVersion, setModelVersion] = useState(modelVersions[0]);
```

### Output State
```typescript
interface EstimatedTimeState {
    hours: number | null;
    minutes: number | null;
    distanceKm: number | null;
    error: ValidationError | null;
    displayLoading: boolean;
    mapRouteLoading: boolean;
}
```

### Map State
```typescript
const [parsedOrigin, setParsedOrigin] = useState<ParsedCoordinate | null>(null);
const [parsedDestination, setParsedDestination] = useState<ParsedCoordinate | null>(null);
const [routeData, setRouteData] = useState<[number, number][] | undefined>(undefined);
const [activeMapPicker, setActiveMapPicker] = useState<'origin' | 'destination' | null>(null);
```

## Workflow: User Input
## Workflow: User Input

### Input Handling
- The InputPanel component provides input fields for origin, destination, time of travel, and model version selection
- Each coordinate input has an associated map picker button (MapPin icon) that activates click-to-select mode
- Input sanitization prevents non-numeric characters (except commas, dots, colons, and spaces) via `onKeyDown` and `onPaste` handlers

### Coordinate Parsing
```typescript
const parseCoordinate = (coordString: string): ParsedCoordinate | null => {
    const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    if (!coordPattern.test(coordString.trim())) {
        return null; 
    }
    const parts = coordString.split(',').map(p => p.trim());
    return {
        lat: parseFloat(parts[0]),
        lon: parseFloat(parts[1])
    };
};
```

### Map Click-to-Select
- When a map picker button is clicked, `activeMapPicker` state is set to either 'origin' or 'destination'
- The map cursor changes to crosshair and a dashed border appears
- User clicks on map, and coordinates are automatically populated in the corresponding input field
- Map picker mode deactivates automatically after selection

```typescript
const handleMapClick = (lat: number, lon: number) => {
    const coordString = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    
    if (activeMapPicker === 'origin') {
        handleOriginChange(coordString);
        setActiveMapPicker(null); 
    } else if (activeMapPicker === 'destination') {
        handleDestinationChange(coordString);
        setActiveMapPicker(null); 
    }
};
```

### Form Submission
- User clicks "Calculate" button, triggering `onSubmit` handler
- Whitespace is removed from all inputs using `flushSync` for synchronous state updates
- The `handleCalculate` function is invoked

## Workflow: Validation

The frontend performs comprehensive validation on user inputs:
The frontend performs comprehensive validation on user inputs:

### Required Field Validation
```typescript
const errors: ValidationError = {};

if (!origin || origin.trim() === '') {
    errors.origin = 'Start position is required';
}
if (!destination || destination.trim() === '') {
    errors.destination = 'Destination is required';
}
if (!timeOfTravel || timeOfTravel.trim() === '') {
    errors.time = 'Time of travel is required';
}
```

### Time Format Validation
```typescript
const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/; // 24-hour format HH:MM
if (timeOfTravel && !timePattern.test(timeOfTravel)) {
    errors.time = 'Invalid time format. Use 24-hour format HH:MM (e.g., 14:00)';
}
```

### Error Display
- If validation errors exist, they are stored in state and displayed in the Display component
- Each error is shown with red text and appropriate field-specific messaging
- The onSubmit function returns early if validation fails
- The onSubmit function returns early if validation fails

## Component Details

### page.tsx - Main Coordinator
**Responsibilities**:
- State management for entire application
- Coordinate parsing and validation
- Business logic orchestration
- Map click handling

**Key Methods**:
- `parseCoordinate()`: Validates and parses coordinate strings
- `handleOriginChange()` / `handleDestinationChange()`: Update input and parsed coordinate state
- `handleMapClick()`: Processes map clicks for coordinate selection
- `handleCalculate()`: Main calculation handler with validation (each group extends with their own backend communication)
- `handleCalculate()`: Main calculation handler with validation (each group extends with their own backend communication)

### inputPanel.tsx - User Input Form
**Responsibilities**:
- Render input fields and controls
- Input sanitization (numeric-only for coordinates)
- Real-time validation feedback
- Help modal toggle
- Results display integration

**Features**:
- Map picker buttons with active state indication
- Custom paste handlers for sanitization
- Keyboard event filtering for numeric inputs
- Error highlighting with red borders
- Model version dropdown selection

**Input Sanitization**:
```typescript
const numericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // Allow shortcuts
    if (!isPrintableKey(e.key)) return; // Allow navigation keys
    if (!/^[0-9.,: ]$/.test(e.key)) e.preventDefault(); // Block invalid chars
};
```

### visualPanel.tsx - Map Container
**Responsibilities**:
- Display interactive map or help modal
- Show loading overlay during route calculation
- Manage help text display

**Features**:
- Conditional rendering: Map view or Help view
- Loading spinner with backdrop blur effect
- City name header (Harbin, China)
- High z-index loading overlay to prevent interaction

### dynamicMap3.tsx - SSR Compatibility Wrapper
**Responsibilities**:
- Dynamic import of Leaflet map component
- Prevent server-side rendering issues
- Show loading placeholder during map initialization

**Implementation**:
```typescript
const MapComponent = dynamic(
  () => import('./map3').then((mod) => mod.Map),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }
);
```

### map3.tsx - Interactive Leaflet Map
**Responsibilities**:
- Render interactive map with OpenStreetMap tiles
- Display origin (green) and destination (red) markers
- Render route polyline
- Handle map click events for coordinate picking
- Auto-adjust bounds to fit markers

**Features**:
- **Custom Markers**: Green for origin, red for destination
- **Click-to-Select**: Crosshair cursor and dashed border in picker mode
- **Route Visualization**: Blue polyline with 70% opacity
- **Popup Information**: Coordinate details on marker click
- **Auto-Bounds**: Automatically fits map view to show all markers
- **Mouse Wheel Zoom**: Enabled for better navigation

**Map Components**:
```typescript
// MapClickHandler: Handles click events and cursor styling
function MapClickHandler({ onMapClick, clickable }: { onMapClick?: Function, clickable?: boolean })

// MapBoundsUpdater: Auto-adjusts map bounds when markers change
function MapBoundsUpdater({ origin, destination }: { origin?: ParsedCoordinate, destination?: ParsedCoordinate })
```

### display.tsx - Results Display
**Responsibilities**:
- Show validation errors
- Display loading state during calculation
- Show calculated travel time (hours and minutes)
- Show distance in kilometers
- Provide placeholder text when idle

**Features**:
- **Progressive Display**: Shows distance immediately when available, even during time calculation
- **Error Grouping**: Displays all validation errors together
- **Loading Spinner**: Animated spinner with descriptive text
- **Formatted Output**: "Xh Ym" format for time, "X.XX km" for distance

### iconButton.tsx - Reusable Icon Button
**Responsibilities**:
- Provide consistent icon button styling
- Handle click events
- Support accessibility (aria-label)

**Features**:
- Rounded design with hover effects
- Focus ring for keyboard navigation
- Customizable via className prop
- Disabled state support

## Configuration

### Map Configuration
Defined in `map3.tsx`:
```typescript
// Default center: Harbin, China
center = [45.755536, 126.636858]
zoom = 10

// Tile Layer: OpenStreetMap
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```
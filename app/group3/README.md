# Group 3 - Travel Time Estimation

## Overview

This application will provide real-time travel time estimation for routes in Harbin, China using LSTM machine learning models. Users can currently select origin and destination points either by typing coordinates or clicking directly on an interactive map. Additionally, a time of travel and a model version is to be specified before submitting the form for calculation. 

## Features

-  **Interactive Map**: Click to select coordinates or manually enter them
-  **Custom Markers**: Green for origin, red for destination
-  **Route Visualization**: Blue polyline showing the calculated route
-  **Travel Time Prediction**: Displays time estimation in hours and minutes 
-  **Distance Calculation**: Displays route distance in kilometers
-  **Map Picker Mode**: Click map pins to activate coordinate selection
-  **Real-time Validation**: Instant feedback on input errors

## Prerequisites

### Frontend Requirements
- Next.js 14+
- React 18+
- Leaflet (for maps)
- Tailwind CSS

## Usage

### Basic Flow

1. **Enter Origin**: Type coordinates (e.g., `45.75, 126.63`) or use map picker
2. **Enter Destination**: Type coordinates (e.g., `45.80, 126.54`) or use map picker
3. **Set Time**: Enter travel time in 24-hour format (e.g., `14:00`)
4. **Select Model**: Choose from available LSTM model versions - Yet to be fetched from backend
5. **Calculate**: Click "Calculate travel time" button - Triggers handleCalculate function
6. **View Results**: Distance and route appears, when route is fetched, followed by travel time estimation, when it is fetched

### Map Picker Mode

- Click the mapPin icon next to an input field to activate picker mode
- Map cursor changes to crosshair with dashed border
- Click anywhere on the map to select coordinates
- Coordinates are automatically formatted and filled into the input
- Click the mapPin icon again to deactivate picker mode

### Input Formats

**Coordinates:**
- Format: `latitude, longitude`
- Example: `45.755536, 126.636858`
- Accepts spaces around comma: `45.75 , 126.63`
- Valid range: All coordinates - Should be restricted based on data

**Time:**
- Format: `HH:MM` (24 - hour)
- Examples: `09:30`, `14:00`, `23:45`

## File Structure

app/group3/
|-- page.tsx              # Main coordinator component
|-- inputPanel.tsx        # Form component with inputs
|-- visualPanel.tsx       # Map container component
|-- display.tsx           # Results display component
|-- map3.tsx              # Leaflet map implementation
|-- dynamicMap3.tsx       # Dynamic import wrapper (SSR disabled)
|-- iconButton.tsx        # Reusable icon button component



### Input Validation
- Coordinates: Must match pattern `/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/`
- Time: Must match 24-hour format `/^([01]?\d|2[0-3]):([0-5]\d)$/`
- All fields required before calculation

### Input Sanitization
- Removes spaces from coordinates
- Prevents non-numeric characters (except comma, dot, colon, space)
- Sanitizes pasted content

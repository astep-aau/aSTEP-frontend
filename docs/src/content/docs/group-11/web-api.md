---
title: Web API Documentation
description: Detailed documentation for the Elessar Web API endpoints
---
The Elessar Web API provides travel time estimation and route planning functionality. Built with Zig and the Zap HTTP framework, it combines A* pathfinding with LSTM-based machine learning predictions to deliver accurate travel time estimates.

## Base Information

- **Base URL:** `http://localhost:3030`
- **Protocol:** HTTP/HTTPS
- **Content-Type:** `application/json`
- **CORS:** Enabled for all origins (`*`)

## Server Configuration

The API server is configured with the following settings:

- **Port:** 3030
- **Max Clients:** 100,000 concurrent connections
- **Worker Threads:** 2 threads, 1 worker (enables state sharing between threads)
- **Request Logging:** Enabled

## Endpoints

### POST /journey

Calculates the optimal route between two coordinates and estimates the travel time using machine learning predictions.

#### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**

```json
{
  "start_coordinate": {
    "lat": number,
    "lon": number
  },
  "end_coordinate": {
    "lat": number,
    "lon": number
  },
  "timetype": "DEPARTURE" | "ARRIVAL",
  "time": {
    "hour": integer (0-23),
    "minute": integer (0-59)
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `start_coordinate` | Object | Yes | Starting point coordinates |
| `start_coordinate.lat` | Number | Yes | Latitude of starting point |
| `start_coordinate.lon` | Number | Yes | Longitude of starting point |
| `end_coordinate` | Object | Yes | Destination coordinates |
| `end_coordinate.lat` | Number | Yes | Latitude of destination |
| `end_coordinate.lon` | Number | Yes | Longitude of destination |
| `timetype` | String | Yes | Whether the time represents departure or arrival. Must be either `"DEPARTURE"` or `"ARRIVAL"` |
| `time` | Object | Yes | Time of travel |
| `time.hour` | Integer | Yes | Hour in 24-hour format (0-23) |
| `time.minute` | Integer | Yes | Minute (0-59) |

**Example Request:**

```json
{
  "start_coordinate": {
    "lat": 45.755536,
    "lon": 126.636858
  },
  "end_coordinate": {
    "lat": 45.760000,
    "lon": 126.650000
  },
  "timetype": "DEPARTURE",
  "time": {
    "hour": 14,
    "minute": 30
  }
}
```

#### Response

**Success Response (200 OK):**

**Response Body Schema:**

```json
{
  "linestring": {
    "type": "LineString",
    "coordinates": [[number, number], ...]
  },
  "traversalTime": number,
  "length": number
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `linestring` | Object | GeoJSON LineString representing the route |
| `linestring.type` | String | Always `"LineString"` - follows GeoJSON specification |
| `linestring.coordinates` | Array | Array of coordinate pairs `[latitude, longitude]` representing waypoints along the route |
| `traversalTime` | Number | Estimated travel time in seconds |
| `length` | Number | Estimated travel distance in meters |

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

## Error Responses

The API uses standard HTTP status codes to indicate success or failure.

### 400 Bad Request

Returned when the request is malformed or missing required fields.

**Possible Causes:**
- Invalid JSON in request body
- Missing request body
- Missing required fields

**Error Response Examples:**

```json
Invalid JSON
```

```json
Missing request body
```

```json
Missing field in JSON
```

### 405 Method Not Allowed

Returned when using an HTTP method other than POST on the `/journey` endpoint.

**Response:**
```json
Method not allowed
```

### 500 Internal Server Error

Returned when an unexpected error occurs during processing.

**Possible Causes:**
- Failed to load graph data files
- A* pathfinding failure
- Database/file access errors

**Response:**
```json
Internal server error
```

## How It Works

When a journey request is received, the API performs the following steps:

1. **Request Validation**
   - Validates JSON structure
   - Checks for required fields
   - Validates time format (hour: 0-23, minute: 0-59)

2. **Coordinate Snapping**
   - Finds the closest road network node to the start coordinate
   - Finds the closest road network node to the end coordinate
   - Ensures coordinates map to actual traversable roads

3. **Data Loading**
   - Loads edge data from CSV (`data/edge_data_day3.csv`)
   - Loads edge connections from CSV (`data/edge_connections.csv`)
   - Loads vertex data from CSV (`data/vertex.csv`)

4. **Travel Time Prediction**
   - Generates lookup table using the LSTM model, which is instanciated on server startup.
   - Uses historical data window (24 time steps = 2 hours)
   - Predicts travel times for next 40 time steps (200 minutes)
   - Each time step represents 5 minutes (300 seconds)

5. **Route Planning**
   - Constructs road network graph from loaded data
   - Runs A* pathfinding algorithm with time-dependent edge weights
   - Uses predicted travel times from the lookup table
   - Finds optimal path considering traffic predictions

6. **Response Construction**
   - Converts node IDs to coordinates
   - Formats route as GeoJSON LineString
   - Calculates total estimated traversal time
   - Returns JSON response

## CORS Configuration

The API is configured with permissive CORS headers to allow cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

The API also handles preflight `OPTIONS` requests automatically.

## Example Usage

### Using curl

```bash
curl -X POST http://localhost:3030/journey \
  -H "Content-Type: application/json" \
  -d '{
    "start_coordinate": {
      "lat": 45.755536,
      "lon": 126.636858
    },
    "end_coordinate": {
      "lat": 45.760000,
      "lon": 126.650000
    },
    "timetype": "DEPARTURE",
    "time": {
      "hour": 14,
      "minute": 30
    }
  }'
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3030/journey', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
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
  })
});

const data = await response.json();
console.log('Route:', data.linestring.coordinates);
console.log('Travel time:', data.traversalTime, 'seconds');
```

### Using Python (requests)

```python
import requests

url = "http://localhost:3030/journey"
payload = {
    "start_coordinate": {
        "lat": 45.755536,
        "lon": 126.636858
    },
    "end_coordinate": {
        "lat": 45.760000,
        "lon": 126.650000
    },
    "timetype": "DEPARTURE",
    "time": {
        "hour": 14,
        "minute": 30
    }
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Route: {data['linestring']['coordinates']}")
print(f"Travel time: {data['traversalTime']} seconds")
```

## Performance Considerations

### Thread Safety

- The LSTM model is protected by a mutex to ensure thread-safe access
- Only one model inference can run at a time per request
- Multiple requests can be processed concurrently by different threads

### Caching

- Graph data is loaded per request (vertices, edges, connections)
- Lookup table is generated fresh for each request

**Note:** In production, consider implementing caching strategies for:
- Graph data (rarely changes)
- Lookup tables (can be cached based on time windows)

### Time Complexity

- **Coordinate snapping:** O(n) where n is number of vertices
- **A\* pathfinding:** O(E log V) where E is edges, V is vertices
- **LSTM inference:** O(1) per edge, O(E) total for all edges
- **Lookup table generation:** O(E × T) where T is prediction time window (40 steps)

## Data Files

The API requires the following data files to be present:

| File Path | Description |
|-----------|-------------|
| `data/edge_data_day7.csv` | Historical travel time data for edges |
| `data/edge_connections.csv` | Road network topology (which edges connect to which) |
| `data/vertex.csv` | Vertex coordinates and metadata |
| `data/best_model.onnx` | Trained LSTM model in ONNX format |

## Limitations

1. **Time Format:** Currently only supports 24-hour time format
2. **Arrival Time:** The `ARRIVAL` timetype is accepted but is not implemented, resulting in a 400 response code error
3. **Geographic Scope:** Limited to the road network defined in the CSV data files
4. **Prediction Window:** Travel time predictions limited to 40 time steps (200 minutes) into the future

## Future Enhancements

Potential improvements for the API include:

- Caching of graph data and lookup tables for better performance
- Support for waypoint routing (multiple stops)
- Alternative route suggestions
- Real-time traffic data integration
- WebSocket support for live updates
- Authentication and rate limiting
- Batch route requests
- Support for different transportation modes

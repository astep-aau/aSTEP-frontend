---
title: Frontent to Backend Communication overview
description: Frontent to Backend Communication documentation
---

## Purpose
...

## Explanation
...

## Workflow
- ...
- ...
- ...

```JavaScript
// Example of code snippet for the documentation page
function example(message) {
    console.log(message);
}
```


## Workflow: Backend Communication

### Request Data Structure
```typescript
interface BackendRequestData {
    Origin: string;
    Destination: string;
    TimeOfTravel: string;
    modelVersion: string;
    CorrelationId: string;
}
```

### Sending Process Creation Request
```typescript
const sendDataToBackend = async (backendUrl: string, dataToSend: BackendRequestData): Promise<void> => {
    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
        const errorMessage = `Failed to fetch route: ${response.status} ${response.statusText}`;
        log.error(errorMessage, new Error(errorMessage));
        setEstimatedTime(prev => ({ 
            ...prev, displayLoading: false,
            mapRouteLoading: false, 
            error: { general: "Error occurred while fetching data." } 
        }));
        throw new Error(`HTTP error! status: ${response.status}`);            
    }
};
```

- **Endpoint**: `{baseUrl}/api/processes`
- **Method**: POST
- **Correlation ID**: Generated using `crypto.randomUUID()` for request tracking
- **Error Handling**: Catches HTTP errors and updates UI state with error messages

### Polling for Route Data
```typescript
const receiveDataFromBackend = async (backendUrl: string, dataToReceive: Record<string, string>): Promise<void> => {
    const startTime = Date.now();
    let response;

    while (Date.now() - startTime < 60000) { // 60 second timeout
        response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            // Process successful response
            return;
        }
        
        // Wait 10 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    throw new Error("Timeout waiting for route data");
};
```

- **Endpoint**: `{baseUrl}/api/route?correlationId={correlationId}`
- **Method**: GET
- **Polling Strategy**: Poll every 10 seconds for up to 60 seconds
- **Timeout Handling**: If no successful response within 60 seconds, throw error

### Response Data Processing
```typescript
const responseData = await response.json();

// Extract and transform route coordinates
const route = responseData.path?.map((point: { latitude: number, longitude: number }) => 
    [point.latitude, point.longitude] as [number, number]
) || undefined;
setRouteData(route);

// Calculate hours and minutes from total minutes
const totalMinutes = responseData.travelTimeMinutes || 0;
const hours = Math.floor(totalMinutes / 60);
const minutes = Math.floor(totalMinutes % 60);

// Update state with all results
setEstimatedTime(prev => ({
    ...prev,
    hours: hours,
    minutes: minutes,
    distanceKm: responseData.distanceKm || null,
    mapRouteLoading: false,
    displayLoading: false,
    error: null
}));
```

**Response Structure**:
```typescript
{
    correlationId: string;
    origin: string;
    destination: string;
    distanceKm: number;
    travelTimeMinutes: number;
    path: Array<{
        latitude: number;
        longitude: number;
    }>;
}
```

### errorLogging.tsx - Logging Utility
**Responsibilities**:
- Log informational messages in development
- Log errors to backend in production
- Provide consistent logging interface

**Implementation**:
```typescript
export const log = {
    info: (message: string, data?: any) => {
        if (isDevelopment) {
            console.log(`INFO: ${message}`, data);
        }
    },
    error: async (message: string, error?: Error | string | object) => {
        if (isDevelopment) {
            console.error(`ERROR: ${message}`, error);
        }
        
        if (!isDevelopment) {
            // Send to backend logging endpoint
            await fetch('{baseUrl}/api/logs/frontend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    url: window.location.href,
                    error: errorDetails
                })
            });
        }
    }
};
```

## Error Handling Strategy

### Client-Side Validation Errors
- Field-specific error messages (origin, destination, time)
- Red border highlighting on invalid fields
- Display all errors simultaneously in Display component
- Prevent API calls when validation fails

### API Communication Errors
- HTTP error status codes caught and logged
- Generic error message displayed to user
- Loading state cleared immediately
- OperationCanceledException handling for request cancellation

### Timeout Handling
- 60-second maximum wait time for route data
- 10-second intervals between polling attempts
- Clear error messaging when timeout occurs
- Automatic loading state cleanup

### Try-Catch Pattern
```typescript
try {
    await sendDataToBackend(backendUrlPost, requestData);
    await receiveDataFromBackend(backendUrlGet, { CorrelationId: correlationId });
} catch (error) {
    setEstimatedTime(prev => ({ 
        ...prev, 
        displayLoading: false, 
        mapRouteLoading: false, 
        error: { general: "An error occurred during calculation." } 
    }));
}
```
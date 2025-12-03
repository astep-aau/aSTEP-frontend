---
title: Frontend to Backend Communication overview
description: Frontend to Backend Communication documentation
---

## Purpose
The purpose of the frontend-backend communication documentation is to showcase how we handle the communication between the frontend and the backend. This communication is important to get right, as we otherwise cannot communicate or provide the user with a response to their request. Additionally, we do not want the frontend to call the backend for results before they are ready. This is done to avoid falsely displaying error message to the user when data simply is not ready yet, but will be ready soon.

## Explanation
The frontend is always ready to be used by the user. Whenever the user inputs a valid origin, destination, time of travel and decides on which model to use, the user is able to request a route and time estimate of that route. Internally, the function `handleCalculate` is responsible for calling the two other main functions (`sendDataToBackend` and `receiveDataFromBackend`). When the user requests a route and time estimate `handleCalculate` calls `sendDataToBackend` functions (documentation showcased below). Using HTTP polling, the function `receiveDataFromBackend` (documentation showcased below) is then called 6 times in 10 second intervals, asking the backend for a response object, containing the route as an Array of lon, lat coordinates, distance of the route and time estimate of that route.

## Overall Workflow
- User creates request. Data structure showcased below -> `BackendRequestData`.
- `handleCalculate` is called on submit, calling `sendDataToBackend` and afterwards `receiveDataFromBackend`.
- `sendDataToBackend` sends the data to the backend where it is handled.
- `receiveDataFromBackend` asks the backend for a response every 10 seconds. If no response is provided after 60 seconds an error is displayed to the user.

### Retrieval of Base URL
The base URL is not hardcoded in any if the typescript files. Instead it is saved in an environment file KUBE_ENV. There are different fallback cases in the event an error or undefined is retrieved as part of the initial process.env URL retrieval. The URL is initially saved in one file and exported to another file. This is done since, in Kubernetes, the backend URL changes based on the deployment stage but the docker image deployed in Kubernetes remains the same always. By initially reading the environment variable in a Server component, `page.tsx`, we avoid setting the URL at build time. Instead we allow dynamic injections of the URL.
```typescript
// page.tsx file -> Where the URL is saved and returned
export default function Page() {
    const url = process.env.GROUP3_URL || process.env.NEXT_PUBLIC_GROUP3_URL || "";
    return <Group3Client backendUrl={url} />;
}

// Group3Client.tsx -> Where the URL is used.
const baseUrl = backendUrl;
if (!baseUrl) {
    throw new Error("Backend URL is not defined.");
}
```
Additioally, if the baseUrl variable is empty an new Error is thrown.

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

## Sending Process Creation Request
The function is an asynchronous flow, awaiting a successful post to the backend. The method is POST, and if the response returned by the backend (for the initial request) is not OK, an error is logged. The function takes two parameters: the url as a string and the data which is send to the backend as the data structure showcased above.
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


## Receiving Data From the Backend and Polling for Route Data
This function is responsible for retrieving the final response from the backend. The function essentially calls the backend with a GET method, asking for the relevant described route and time data. It executes an asynchronous GET request to fetch the calculated route and time estimates. The function accepts two parameters: the url as a string and the query data as a Record. To handle the processing time required by the backend without triggering premature errors, the function implements an HTTP polling mechanism. Starting from the initial call (`startTime`), it attempts to fetch the response at intervals for up to 60 seconds. This effectively makes sure the backend has sufficient time to identify the route, calculate the distance, and estimate the travel time before returning the result. (For clarity, the handling of the OK response is omitted and will be showcased by itself). The polling is handled in a while loop, and before the condition is checked, a timeout of 10 seconds is executed effectively waiting the 10 seconds before trying another fetch.
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

### Response Data Structure
This is the response data structure the backend sends to the frontend. It contains relevant information such as the distance in kilometers (as a `number`), travel time in minutes (as a `number`), and the route itself (as an `array` of `number`).
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

### Response Data Processing
This is the earlier mentioned omitted handling of the response when the frontend gets a response by the backend. It handles both setting the route using the helper `setRouteData` and displaying the updated time and distance to the user using the helper `setEstimatedTime`. 
**Route Data Transformation:**
The backend returns the path as an array of objects containing `latitude` and `longitude` coordinates (as explained initially). Making this compatible with the frontend map component, we map over the array to create a list of coordinates tuples (`lat, long`). This data structure is then passed to the helper `setRouteData`. 
**Updating State with Results:**
When displaying the result to the user, we make sure to change the boolean flags `mapRouteLoading` and `displayLoading` to false, making sure that the results is actually visible in the frontend.
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

## Error Handling Strategy
This is the general error handling strategy used when communicating between the frontend and backend. To make sure that we catch all errors, the entire communication with the backend is encapsulated in a try-catch block. If an error is thrown and caught, we update the booleans showing loading to false, and instead update the error to display a generic error message to the user, effectively making the user know something went wrong.

### API Communication Errors
- HTTP error status codes caught and logged
- Generic error message displayed to user
- Loading state cleared immediately
- OperationCanceledException handling for request cancellation

### Timeout Handling
- 60-second maximum wait time for route data
- 10-second intervals between polling attempts
- Automatic loading state cleanup

### Try-Catch Pattern
The request data structure, creating the variables saving the urls, and creating the variable for storing the correlation Id is omitted for clarity. They were present where `// ... //` is located.
```typescript
try {
    // ... //
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

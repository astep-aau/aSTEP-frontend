"use client";

import { InputPanel } from "./inputPanel";
import { VisualPanel } from "./visualPanel";
import React, { useState } from "react"; 

// Måske bruges, nok sættes i ny fil ifølge robotten

export interface ParsedCoordinate { lat: number; lon: number; }
export interface EstimatedTimeState {
    hours: number | null;
    minutes: number | null;
    error: ValidationError | null;
    displayLoading: boolean;
    mapRouteLoading: boolean;
}

interface ValidationError {
    origin?: string;
    destination?: string;
    time?: string;
    general?: string;
}

export default function Group3Page() {
    // TODO: Skal hentes fra database
    const modelVersions = ["LSTM 1.01", "LSTM 1.1", "LSTM 2.0 (Experimental)"]; 
    const [help, setHelp] = useState(false);

    // Application Input State (Used by InputPanel)
    const [origin, setOrigin] = useState(''); 
    const [destination, setDestination] = useState('');
    const [timeOfTravel, setTimeOfTravel] = useState('');
    const [modelVersion, setModelVersion] = useState(modelVersions[0]);

    // TODO: Replace values with variables from backend
    // Application Output State (Used by InputPanel (Display) and VisualPanel (Route))
    const [estimatedTime, setEstimatedTime] = useState<EstimatedTimeState>({ 
        hours: null, minutes: null, error: null, displayLoading: false, mapRouteLoading: false
    });

    // TODO: Fix to be used for map display
    const [parsedOrigin, setParsedOrigin] = useState<ParsedCoordinate | null>(null);
    const [parsedDestination, setParsedDestination] = useState<ParsedCoordinate | null>(null);
    const [routeData, setRouteData] = useState<any>(null); // State for the route geometry/points
    
    // Map picker state - tracks which input field is active for map picking
    const [activeMapPicker, setActiveMapPicker] = useState<'origin' | 'destination' | null>(null);
    
    // Helper function to parse coordinate string into ParsedCoordinate object
    const parseCoordinate = (coordString: string): ParsedCoordinate | null => {
        const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
        if (!coordPattern.test(coordString.trim())) {
            return null; // Invalid format
        }
        const parts = coordString.split(',').map(p => p.trim());
        return {
            lat: parseFloat(parts[0]),
            lon: parseFloat(parts[1])
        };
    };

    // Wrapped setters that also update parsed coordinates
    const handleOriginChange = (value: string) => {
        setOrigin(value);
        setParsedOrigin(parseCoordinate(value));
    };

    const handleDestinationChange = (value: string) => {
        setDestination(value);
        setParsedDestination(parseCoordinate(value));
    };

    // Handle map click when map picker is active
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
    
    // Function to send data to backend API
    const sendDataToBackend = async (backendUrl: string, dataToSend: any ): Promise<void> => {
      try{
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
          });

          // Handle non-OK responses
          if (!response.ok) {
            setEstimatedTime(prev => ({ ...prev, displayLoading: false, mapRouteLoading: false, error: { general: "Error occurred while fetching data." } }));
            throw new Error(`HTTP error! status: ${response.status}`);            
          }

          // Handle ok responses
          if (response.ok) {
            console.log("Backend response received successfully.");
          }
        } catch (error) {
          console.error("Error during API call:", error);
          setEstimatedTime(prev => ({ ...prev, displayLoading: false, mapRouteLoading: false, error: { general: "unknown error occurred" } }));
        }
    };

    var receiveRouteFromBackend = async (backendUrl: string, dataToReceive: any): Promise<void> => {
        try {
            const response = await fetch(backendUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const responseData = await response.json();

                setRouteData(responseData.path);
                setEstimatedTime(prev => ({ ...prev, mapRouteLoading: false, error: null }));                
            }

             if (!response.ok) {
                // Handle non-OK responses
                console.error("Error response from backend:", response.status);
                setEstimatedTime(prev => ({ ...prev, displayLoading: false, mapRouteLoading: false, error: { general: "Error occurred while fetching data." } }));
                return;
            }
        }
        catch (error) {
            console.error("Error during API call:", error);
            setEstimatedTime(prev => ({ ...prev, displayLoading: false, mapRouteLoading: false, error: { general: "unknown error occurred" } }));
        }
    }

    //  Function to fetch travel time data from backend API on url: localhost:5000/api/GetTravelTimeEndpoint
    var receiveTimeFromBackend = async (backendUrl: string, dataToReceive: any): Promise<void> => {
        try {
            // Convert dataToReceive to query string
            const queryString = new URLSearchParams(dataToReceive).toString();
            const fullUrl = `${backendUrl}?${queryString}`;

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log("Received data from backend:", responseData);
                
                // Convert total minutes to hours, minutes, and seconds
                const totalMinutes = responseData.travelTimeMinutes || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = Math.floor(totalMinutes % 60);
                
                // Update state with received data as needed
                setEstimatedTime(prev => ({ 
                    ...prev, 
                    hours: hours,
                    minutes: minutes,
                    displayLoading: false,
                    mapRouteLoading: false,
                    error: null
                }));
                return;
            }
            if (!response.ok) {
                // Handle non-OK responses
                console.error("Error response from backend:", response.status);
                setEstimatedTime(prev => ({ ...prev, displayLoading: false, mapRouteLoading: false, error: { general: "Error occurred while fetching data." } }));
                return;
            }
        }
        catch (error) {
            console.error("Error during API call:", error);
            setEstimatedTime(prev => ({ ...prev, displayLoading: false, mapRouteLoading: false, error: { general: "unknown error occurred" } }));
        }
    }

    // Main calculation handler triggered onSubmit from InputPanel
    const handleCalculate = async () => {
        const errors: ValidationError = {};

        // validate that fields are not empty:
        if (!origin || origin.trim() === '') {
            errors.origin = 'Start position is required';
        }
        if (!destination || destination.trim() === '') {
            errors.destination = 'Destination is required';
        }
        if (!timeOfTravel || timeOfTravel.trim() === '') {
            errors.time = 'Time of travel is required';
        }

        // Check time format
        const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/; // 24-hour format HH:MM
        if (timeOfTravel && !timePattern.test(timeOfTravel)) {
            errors.time = 'Invalid time format. Use 24-hour format HH:MM (e.g., 14:00)';
        }

        // If there are validation errors, update state and exit
        if (Object.keys(errors).length > 0) {
            setEstimatedTime(prev => ({ ...prev, error: errors, displayLoading: false, mapRouteLoading: false }));
            return;
        }

        // Proceed with calculation if validation passes - Loading state
        setEstimatedTime(prev => ({ ...prev, displayLoading: true, mapRouteLoading: true, error: null }));

        const correlationId = crypto.randomUUID();

        // Prepare JSON data for backend, matching the C# CreateProcessRequest
        const requestData = {
          Origin: origin,
          Destination: destination,
          TimeOfTravel: timeOfTravel,
          modelVersion: modelVersion,
          CorrelationId: correlationId
        };
        const backendUrlPost = "http://localhost:5000/api/processes";
        const backendUrlFetchTime = `http://localhost:5000/api/GetTravelTimeEndpoint/${correlationId}`;
        const backendUrlGetRoute = `http://localhost:5000/api/route?correlationId=${correlationId}`;

        // Send data to backend - function handles errors and updates state
        await sendDataToBackend(backendUrlPost, requestData);
        // Wait for 5 seconds before fetching the result
        await new Promise(resolve => setTimeout(resolve, 100000));
        await receiveRouteFromBackend(backendUrlGetRoute, { CorrelationId: correlationId });
        await new Promise(resolve => setTimeout(resolve, 5000));
        await receiveTimeFromBackend(backendUrlFetchTime, { CorrelationId: correlationId });
        
      };
     
    return (
        <div className="font-sans">
            <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8"> 
                
                {/* Main Content Layout: Form (Left) and Map (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-10 w-full h-full items-stretch min-h-[650px] max-h-[900px] ">
                    
                    {/* Input Panel */}
                    <InputPanel 
                        origin={origin}
                        setOrigin={handleOriginChange}
                        destination={destination}
                        setDestination={handleDestinationChange}
                        timeOfTravel={timeOfTravel}
                        setTimeOfTravel={setTimeOfTravel}
                        modelVersion={modelVersion}
                        setModelVersion={setModelVersion}
                        estimatedTime={estimatedTime}
                        handleCalculate={handleCalculate}
                        modelVersions={modelVersions}
                        help={help}
                        setHelp={setHelp}
                        pageName="Travel Time Estimation"
                        onOriginMapClick={() => setActiveMapPicker('origin')}
                        onDestinationMapClick={() => setActiveMapPicker('destination')}
                        activeMapPicker={activeMapPicker}
                    />
                    
                    {/* Visual Panel (Map) */}
                    <VisualPanel 
                        origin={parsedOrigin}
                        destination={parsedDestination}
                        routeData={routeData}
                        loading={estimatedTime.mapRouteLoading}
                        helpOpen={help}
                        onMapClick={handleMapClick}
                        clickable={activeMapPicker !== null}
                    />
                
                </div>
            </main>
        </div>
    );
}

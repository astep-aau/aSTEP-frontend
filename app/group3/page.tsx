"use client";

import { InputPanel } from "./inputPanel";
import { VisualPanel } from "./visualPanel";
import React, { useState } from "react"; 

export interface ParsedCoordinate { lon: number; lat: number; }
export interface EstimatedTimeState {
    hours: number | null;
    minutes: number | null;
    seconds: number | null;
    error: string | null;
    loading: boolean;
}

export default function Group3Page() {
    // Skal hentes fra database
    const modelVersions = ["LSTM 1.0", "LSTM 1.1", "LSTM 2.0 (Experimental)"]; 
    const [help, setHelp] = useState(false);

    // Nedenstående frem til return af funktionen er noget robotten har fundet på, lav gerne om.
    // Application Input State (Used by InputPanel)
    const [origin, setOrigin] = useState(''); 
    const [destination, setDestination] = useState('');
    const [timeOfTravel, setTimeOfTravel] = useState('');
    const [modelVersion, setModelVersion] = useState(modelVersions[0]);

    // Application Output State (Used by InputPanel (Display) and VisualPanel (Route))
    const [estimatedTime, setEstimatedTime] = useState<EstimatedTimeState>({ 
        hours: null, minutes: null, seconds: null, error: null, loading: false 
    });

    // We'll store the validated coordinates and route here once calculated
    const [parsedOrigin, setParsedOrigin] = useState<ParsedCoordinate | null>(null);
    const [parsedDestination, setParsedDestination] = useState<ParsedCoordinate | null>(null);
    const [routeData, setRouteData] = useState<any>(null); // State for the route geometry/points

    // Helper to safely parse coordinate string "lon, lat"
    const parseCoordinates = (coordString: string) => {
        const parts = coordString.split(',').map(p => p.trim());
        const lon = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        return { lon, lat, valid: parts.length === 2 && !isNaN(lon) && !isNaN(lat) };
    };

    const handleCalculate = async () => {
        const originCoords = parseCoordinates(origin);
        const destinationCoords = parseCoordinates(destination);
    
        // 1. Validation 
        if (!originCoords.valid || !destinationCoords.valid || !timeOfTravel) {
          setEstimatedTime({ ...estimatedTime, error: "Please enter valid coordinates and time.", loading: false });
          return;
        }
    
        setEstimatedTime({ ...estimatedTime, loading: true, error: null });
        setParsedOrigin({ lon: originCoords.lon, lat: originCoords.lat });
        setParsedDestination({ lon: destinationCoords.lon, lat: destinationCoords.lat });

        // 2. Prepare JSON data for backend
        const requestData = {
          startPosition: { lon: originCoords.lon, lat: originCoords.lat },
          destination: { lon: destinationCoords.lon, lat: destinationCoords.lat },
          timeOfTravel, 
          modelVersion,
        };
        
        console.log("Sending request to backend:", requestData);
    
        try {
          // Placeholder: Simulate API call and route data retrieval
          await new Promise(resolve => setTimeout(resolve, 1500)); 
    
          setEstimatedTime({
            hours: 1,
            minutes: 35,
            seconds: 12,
            error: null,
            loading: false,
          });
          
          // Simulate route data (e.g., list of coordinates for a polyline)
          setRouteData([
              [originCoords.lat, originCoords.lon],
              [45.76, 126.65], 
              [destinationCoords.lat, destinationCoords.lon],
          ]);

        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
          setEstimatedTime({ ...estimatedTime, error: errorMessage, loading: false });
          setRouteData(null);
        }
    };

    return (
        <div className="font-sans">
            <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8"> 
                
                {/* Main Content Layout: Form (Left) and Map (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-10 w-full h-full items-stretch">
                    
                    {/* Input Panel */}
                    <InputPanel 
                        origin={origin}
                        setOrigin={setOrigin}
                        destination={destination}
                        setDestination={setDestination}
                        timeOfTravel={timeOfTravel}
                        setTimeOfTravel={setTimeOfTravel}
                        modelVersion={modelVersion}
                        setModelVersion={setModelVersion}
                        estimatedTime={estimatedTime}
                        handleCalculate={handleCalculate}
                        modelVersions={modelVersions}
                        pageName="Travel Time Estimation"
                    />
                    
                    {/* Visual Panel (Map) */}
                    <VisualPanel 
                        origin={parsedOrigin}
                        destination={parsedDestination}
                        routeData={routeData}
                        loading={estimatedTime.loading}
                        helpOpen={help}
                    />
                    
                </div>
            </main>
        </div>
    );
}

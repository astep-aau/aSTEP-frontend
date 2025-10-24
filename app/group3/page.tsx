"use client";

import { InputPanel } from "./inputPanel";
import { VisualPanel } from "./visualPanel";
import React, { useState } from "react"; 

// Måske bruges
export interface ParsedCoordinate { lon: string; lat: string; }
export interface EstimatedTimeState {
    hours: number | null;
    minutes: number | null;
    seconds: number | null;
    error: ValidationError | null;
    loading: boolean;
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
        hours: null, minutes: null, seconds: null, error: null, loading: false 
    });

    // TODO: Fix to be used for map display
    const [parsedOrigin, setParsedOrigin] = useState<ParsedCoordinate | null>(null);
    const [parsedDestination, setParsedDestination] = useState<ParsedCoordinate | null>(null);
    const [routeData, setRouteData] = useState<any>(null); // State for the route geometry/points
    
    const handleCalculate = async () => {
        const errors: ValidationError = {};
        

        // If any validation errors exist, update state and return
        if (Object.keys(errors).length > 0) {
            setEstimatedTime({ ...estimatedTime, error: errors, loading: false });
            return;
        }

        // Proceed with calculation if validation passes
        setEstimatedTime({ ...estimatedTime, loading: true, error: null });

        // 2. Prepare JSON data for backend, matching the C# CreateProcessRequest
        const requestData = {
          Origin: origin, // Send the original string "lon, lat"
          Destination: destination, // Send the original string "lon, lat"
          TimeOfTravel: timeOfTravel, 
          // modelVersion is not in the C# class, so we don't send it.
        };
        
        console.log("Sending request to backend:", requestData);
    
        try {
          // Replace with your actual backend endpoint URL
          const backendUrl = "http://localhost:5000/api/processes";

          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Here the frontend would process the response, but its not implemented in this example. As the backend is not ready
          // Therefore it is just logged to the console if the response was ok or not.
          if (response.ok) {
            console.log("Backend response received successfully.");
            estimatedTime.loading = true;
          } else if (!response.ok) {
            console.log("Error response from backend:", response.statusText);
          }
        
        } catch (e) {
            console.error("Error during API call:", e);
        }};

    return (
        <div className="font-sans">
            <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8"> 
                
                {/* Main Content Layout: Form (Left) and Map (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-10 w-full h-full items-stretch min-h-[650px] max-h-[900px] ">
                    
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
                        help={help}
                        setHelp={setHelp}
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

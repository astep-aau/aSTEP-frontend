"use client";

import { InputPanel } from "./inputPanel";
import { VisualPanel } from "./visualPanel";
import React, { useState } from "react"; 

// Måske bruges, nok sættes i ny fil ifølge robotten

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
            setEstimatedTime(prev => ({ ...prev, loading: false, error: { general: "Error occurred while fetching data." } }));
            throw new Error(`HTTP error! status: ${response.status}`);            
          }

          // Handle ok responses
          if (response.ok) {
            console.log("Backend response received successfully.");
          }
        } catch (error) {
          console.error("Error during API call:", error);
          setEstimatedTime(prev => ({ ...prev, loading: false, error: { general: "unknown error occurred" } }));
        }
    };

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

        // Check coordinates format
        const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/; // e.g., 126.63, 45.75
        if (origin && !coordPattern.test(origin)) {
            errors.origin = 'Invalid format. Use: longitude, latitude (e.g., 126.63, 45.75)';
        }
        if (destination && !coordPattern.test(destination)) {
            errors.destination = 'Invalid format. Use: longitude, latitude (e.g., 126.54, 45.80)';
        }

        // Check time format
        const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/; // 24-hour format HH:MM
        if (timeOfTravel && !timePattern.test(timeOfTravel)) {
            errors.time = 'Invalid time format. Use 24-hour format HH:MM (e.g., 14:00)';
        }

        // If there are validation errors, update state and exit
        if (Object.keys(errors).length > 0) {
            setEstimatedTime(prev => ({ ...prev, error: errors, loading: false }));
            return;
        }

        // Proceed with calculation if validation passes - Loading state
        setEstimatedTime(prev => ({ ...prev, loading: true, error: null }));
        
        // Prepare JSON data for backend, matching the C# CreateProcessRequest
        const requestData = {
          Origin: origin, 
          Destination: destination,
          TimeOfTravel: timeOfTravel, 
          // modelVersion is not in the C# class, so we don't send it.
        };
        const backendUrl = "http://localhost:5000/api/processes";
        
        console.log("Sending request to backend:", requestData);

        // Send data to backend - function handles errors and updates state
        await sendDataToBackend(backendUrl, requestData);
      };
     
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

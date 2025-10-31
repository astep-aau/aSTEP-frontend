"use client";

/**
 * Group 3 - Travel Time Estimation Application
 * 
 * This is the main coordinator component that manages all state and business logic
 * for the travel time estimation feature. It handles:
 * - User input for origin, destination, and travel time
 * - Coordinate parsing and validation
 * - Map interaction (click-to-select coordinates)
 */

import { InputPanel } from "./inputPanel";
import { VisualPanel } from "./visualPanel";
import React, { useState } from "react"; 

// For map use
export interface ParsedCoordinate {     
    lat: number; 
    lon: number; 
}

// Keep track of backend response state
export interface EstimatedTimeState {
    hours: number | null;
    minutes: number | null;
    distanceKm: number | null;
    error: ValidationError | null;
    displayLoading: boolean;
    mapRouteLoading: boolean;
}

// Keep track of type of errors
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

    // Application Input State 
    const [origin, setOrigin] = useState(''); 
    const [destination, setDestination] = useState('');
    const [timeOfTravel, setTimeOfTravel] = useState('');
    const [modelVersion, setModelVersion] = useState(modelVersions[0]);

    // Application Output State
    const [estimatedTime, setEstimatedTime] = useState<EstimatedTimeState>({ 
        hours: null, minutes: null, distanceKm: null, error: null, displayLoading: false, mapRouteLoading: false
    });

    // Map related state
    const [parsedOrigin, setParsedOrigin] = useState<ParsedCoordinate | null>(null);
    const [parsedDestination, setParsedDestination] = useState<ParsedCoordinate | null>(null);
    const [routeData, setRouteData] = useState<any>(null); // State for the route geometry/points
    
    // Map picker state - tracks which input field is active for map picking
    const [activeMapPicker, setActiveMapPicker] = useState<'origin' | 'destination' | null>(null);
    
    // Helper function to parse coordinate string into ParsedCoordinate object
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

        // Backend API calls

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

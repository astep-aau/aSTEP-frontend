"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin } from "lucide-react"; // Import MapPin for the icon overlay
import React, { useState } from 'react';
import { WrittenInput } from "./writtenInput";
import { SelectInput } from "./selectInput";
import { Display } from "./display";
// import { estimateTravelTime } from "@/services/apiService"; 
// ----------------------------------------

// --- Types (Simplified Coordinate to a single string for Lon, Lat) ---
export interface CoordinateString { coordinate: string; } // Example: "55.70, 12.57"
export interface EstimatedTimeState {
  hours: number | null;
  minutes: number | null;
  seconds: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * Main Input Panel Component (Form)
 */
export function InputPanel() {
  const modelVersions = ["LSTM 1.0", "LSTM 1.1", "LSTM 2.0 (Experimental)"];

  // State for all inputs (Now using single string for coordinates)
  const [origin, setOrigin] = useState(''); // e.g., "55.70, 12.57"
  const [destination, setDestination] = useState('');
  const [timeOfTravel, setTimeOfTravel] = useState('');
  const [modelVersion, setModelVersion] = useState(modelVersions[0]);

  const [estimatedTime, setEstimatedTime] = useState<EstimatedTimeState>({ 
      hours: null, minutes: null, seconds: null, error: null, loading: false 
  });
  
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

    // 1. Validation (checking single string for all required parts)
    if (!originCoords.valid || !destinationCoords.valid || !timeOfTravel) {
      setEstimatedTime({ ...estimatedTime, error: "Please enter valid coordinates and time.", loading: false });
      return;
    }

    setEstimatedTime({ ...estimatedTime, loading: true, error: null });

    // 2. Prepare JSON data for backend
    const requestData = {
      startPosition: { 
          lon: originCoords.lon, 
          lat: originCoords.lat
      },
      destination: { 
          lon: destinationCoords.lon, 
          lat: destinationCoords.lat
      },
      timeOfTravel, 
      modelVersion,
    };
    
    console.log("Sending request to backend:", requestData); // Placeholder for API call

    try {
      // 3. Send data to the backend (or simulate)
      // const result = await estimateTravelTime(requestData); 

      // Placeholder: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      setEstimatedTime({
        hours: 1,
        minutes: 35,
        seconds: 12,
        error: null,
        loading: false,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setEstimatedTime({ ...estimatedTime, error: errorMessage, loading: false });
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-md">
      
      {/* Title */}
      <h2 className="text-xl font-bold mb-4 text-center">
        Travel Time Estimation
      </h2>
      
      {/* Origin Input (Single field) */}
      <div className="relative">
          <WrittenInput 
              label="Start position" 
              placeholder="(lon, lat)" 
              value={origin} 
              onChange={setOrigin} 
              // Add padding to make space for the icon
              className="pr-10"
          />
          <MapPin className="absolute right-3 top-10 -translate-y-1/2 size-4" />
      </div>

      {/* Destination Input (Single field) */}
      <div className="relative">
          <WrittenInput 
              label="Destination" 
              placeholder="(lon, lat)" 
              value={destination} 
              onChange={setDestination} 
              className="pr-10"
          />
          <MapPin className="absolute right-3 top-10 -translate-y-1/2 size-4" />
      </div>

      {/* Time of Travel Input (Uses WrittenInput) */}
      <WrittenInput 
          label="Time of travel"
          placeholder="(Time of day)" 
          value={timeOfTravel}
          onChange={setTimeOfTravel}
      />

      {/* Model Select (Uses SelectInput) */}
      <SelectInput 
          label="Model version" 
          value={modelVersion} 
          onChange={setModelVersion}
          versions={modelVersions}
      />

      {/* Calculate Button */}
      <Button 
          className="mt-4 w-full" 
          size="lg" 
          variant="secondary" 
          onClick={handleCalculate}
          disabled={estimatedTime.loading}
      >
        {estimatedTime.loading ? "Calculating..." : "Calculate travel time"}
      </Button>
      
      <Separator className="mt-4 mb-2" />

      {/* Estimated Travel Time Display (Uses Display) */}
      <Display 
          time={estimatedTime} 
          error={estimatedTime.error} 
          loading={estimatedTime.loading}
      />
    </div>
  );
}
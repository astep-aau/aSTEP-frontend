"use client"

import React from "react"; 
import { ParsedCoordinate } from "./page"; 
import { Loader2 } from "lucide-react";

// Cooket af robotten
// Mock Map Component (for illustration purposes)
const MockMap = ({ origin, destination, routeData }: { 
    origin: ParsedCoordinate | null, 
    destination: ParsedCoordinate | null, 
    routeData: any 
}) => {
    
    let statusMessage = "Enter coordinates and click 'Calculate' to see the route.";
    let lineColor = routeData ? "border-green-500" : "border-gray-300";

    if (origin && destination && routeData) {
        statusMessage = `Route calculated from (${origin.lon.toFixed(2)}, ${origin.lat.toFixed(2)}) to (${destination.lon.toFixed(2)}, ${destination.lat.toFixed(2)}).`;
    } else if (origin && destination) {
        statusMessage = "Coordinates entered. Waiting for calculation...";
    }

    // A simple visual representation of the map area

    return (
        <div className={`w-full h-full min-h-[400px] bg-gray-100 rounded-lg border-2 border-dashed ${lineColor} flex flex-col items-center justify-center p-4 transition duration-500`}>
            {routeData && (
                <div className="text-sm text-gray-700 font-mono mb-4 text-center">
                    Route Points: {routeData.length}
                </div>
            )}
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Map View (Harbin)</h4>
            <p className="text-sm text-gray-500 text-center">{statusMessage}</p>
        </div>
    );
}

// Component Props 
interface VisualPanelProps {
    origin: ParsedCoordinate | null;
    destination: ParsedCoordinate | null;
    routeData: any; // Route geometry/points
    loading: boolean;
    helpOpen: boolean;}

// Main Visual Panel Component 

export function VisualPanel({ origin, destination, routeData, loading, helpOpen }: VisualPanelProps) {
    // mulighed for at adde andet
    const cityName = "Harbin, China";

    if (helpOpen) {
        return (
            <div className="flex flex-col gap-5 p-6 rounded-lg border shadow-lg w-full h-full overflow-y-auto max-h-[700px]">
                <div className="text-sm">
                    <ul className="space-y-2">
                        <li><strong>Start position</strong>: Enter lon, lat (e.g., 126.63, 45.75)</li>
                        <li><strong>Destination</strong>: Same format as start.</li>
                        <li><strong>Time</strong>: 24-hour format, e.g., 14:00.</li>
                        <li><strong>Model</strong>: Choose between available model versions.</li>
                    </ul>
                </div>
            </div>  
    )}
    
    return (
        <div className="flex flex-col gap-5 p-6 rounded-lg border shadow-lg w-full h-full overflow-y-auto">
      
      {/* Location Header (City Title) */}
      <h2 className="text-xl font-bold mb-2 text-center text-decoration: underline">
        {cityName}
      </h2>
      
      {/* Map Content Area */}
            <div className="w-full h-full relative">
                <MockMap origin={origin} destination={destination} routeData={routeData} />

        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg font-medium text-blue-700">Drawing Route...</span>
            </div>
        )}
      </div>
    </div>
  );
}

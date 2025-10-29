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
        statusMessage = `Route calculated from (${origin.lon}, ${origin.lat}) to (${destination.lon}, ${destination.lat}).`;
    } else if (origin && destination) {
        statusMessage = "Coordinates entered. Waiting for calculation...";
    }

    // A simple visual representation of the map area
    return (
        <div className={`w-full h-full min-h-[600px] bg-gray-100 rounded-lg border-2 border-dashed ${lineColor} flex flex-col items-center justify-center p-4 transition duration-500`}>
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
    helpOpen?: boolean;
    onCloseHelp?: () => void;
}

// Main Visual Panel Component 

export function VisualPanel({ origin, destination, routeData, loading, helpOpen, onCloseHelp }: VisualPanelProps) {
    const cityName = "Harbin, China";

    return (
        <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-xl w-full h-full">
      
      {/* Location Header (City Title) */}
      <h2 className="text-xl font-bold mb-2 text-center">
        {cityName}
      </h2>

            {/* Help modal overlay on top of VisualPanel */}
            {helpOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseHelp} />

                    {/* Modal Card */}
                    <div className="relative z-60 bg-white rounded-lg shadow-lg max-w-xl w-[90%] p-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold mb-2">Help</h3>
                            <button
                                aria-label="Close help"
                                onClick={onCloseHelp}
                                className="ml-4 rounded-md p-1 text-gray-600 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="text-sm">
                            <ul className="space-y-2">
                                <li><strong>Start position</strong>: Enter lon, lat (e.g., 126.63, 45.75)</li>
                                <li><strong>Destination</strong>: Same format as start.</li>
                                <li><strong>Time</strong>: 24-hour format, e.g., 14:00.</li>
                                <li><strong>Model</strong>: Choose between available model versions.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
      
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

"use client"

/**
 * Visual Panel Component
 * 
 * Container component that manages the map display and help modal.
 */

import React from "react"; 
import { ParsedCoordinate } from "./Group3Client"; 
import { Loader2 } from "lucide-react";
import { Map } from "./dynamicMap3";

// Component Props
interface VisualPanelProps {
    origin: ParsedCoordinate | null;
    destination: ParsedCoordinate | null;
    adjustedOrigin?: ParsedCoordinate | null;
    adjustedDestination?: ParsedCoordinate | null;
    routeData: Array<[number, number]> | undefined; // Route geometry/points
    loading: boolean;
    helpOpen?: boolean;
    onMapClick?: (lat: number, lon: number) => void;
    clickable?: boolean;
}

// Main Visual Panel Component

export function VisualPanel({ origin, destination, adjustedOrigin, adjustedDestination, routeData, loading, helpOpen, onMapClick, clickable }: VisualPanelProps) {
    const cityName = "Harbin, China";

      {/* Help modal overlay on top of VisualPanel */}
            if (helpOpen) {
                return (
                    <div className="flex flex-col gap-5 p-6 rounded-lg border shadow-lg w-full h-full overflow-y-auto max-h-[700px]">
                        <div className="text-sm">
                            <ul className="space-y-2">
                                <li><strong>Start position</strong>: Enter lat, lon (e.g., 45.774827, 126.646415). Use 6 decimals</li>
                                <li><strong>Destination</strong>: Enter lat, lon (e.g., 45.771594, 126.631137). Use 6 decimals</li>
                                <li><strong>Time</strong>: 24-hour format, e.g., 14:00.</li>
                                <li><strong>Model</strong>: Choose between available model versions.</li>
                            </ul>
                        </div>
                    </div>  
    )}

    return (        
        <div className="flex flex-col gap-5 p-6 rounded-lg border shadow-xl w-full h-full">
      
      {/* Location Header (City Title) */}
      <h2 className="text-xl font-bold mb-2 text-center underline">
        {cityName}
      </h2>

      {/* Map Content Area */}
            <div className="w-full h-full relative">
                <div className="h-[550px] w-full rounded-lg border relative">
                    <Map
                        center={[45.7536, 126.6625]}
                        zoom={13}
                        origin={adjustedOrigin || origin}
                        destination={adjustedDestination || destination}
                        routeData={routeData}
                        className="h-[550px] w-full rounded-lg"
                        onMapClick={onMapClick}
                        clickable={clickable}
                    />
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg" style={{ zIndex: 1000 }}>
                            <Loader2 className="h-8 w-8 animate-spin " />
                            <span className="ml-3 text-lg font-medium">Drawing Route...</span>
                        </div>
                    )}
                </div>
      </div>
    </div>
  );
}

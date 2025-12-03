/**
 * Display Component
 * 
 * Renders the results section showing:
 * - Validation errors (if any)
 * - Loading spinner during calculation
 * - Distance (shown immediately when available)
 * - Calculated travel time (hours and minutes)
 * - Placeholder text when no calculation has been done
 * 
 * Key feature: Distance is shown even during loading state,
 * as it's typically available before the time calculation completes
 */

import React from 'react';
import { EstimatedTimeState } from "./Group3Client";
import { Loader2 } from "lucide-react";

interface DisplayProps {
    time: EstimatedTimeState;  // Current estimation state with results
    error: EstimatedTimeState['error'];  // Validation or API errors
    loading: boolean;  // Loading state for time calculation
}

export function Display({ time, error, loading }: DisplayProps) {
    
    /**
     * Renders all validation error messages
     * Shows errors for: origin, destination, time, and general errors
     */
    const renderErrors = (error: NonNullable<EstimatedTimeState['error']>) => {
        return (
            <div className="space-y-1">
                {error.origin && (
                    <p className="text-red-600 font-semibold text-sm">{error.origin}</p>
                )}
                {error.destination && (
                    <p className="text-red-600 font-semibold text-sm">{error.destination}</p>
                )}
                {error.time && (
                    <p className="text-red-600 font-semibold text-sm">{error.time}</p>
                )}
                {error.general && (
                    <p className="text-red-600 font-semibold text-sm">{error.general}</p>
                )}
            </div>
        );
    };

    return (
        <div className="p-2 w-full text-center">
            {error ? (
                /* Show all validation/API errors */
                renderErrors(error)
            ) : (   
                <>
                    {/* Loading Spinner Section - shown while calculation is in progress */}
                    {loading ? (
                        <div className="flex items-center justify-center rounded-lg mb-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-3 text-lg font-medium">Calculating route information...</span>
                        </div>
                    ) : time.hours !== null || time.distanceKm !== null ? (
                        /* Travel Time and Distance Display - shown when calculation completes */
                        <>
                            {time.hours !== null && (
                                <div className={"py-2"}>
                                    <h3 className="text-xl font-semibold">
                                        {`${time.hours}h ${time.minutes ?? 0}m`}
                                    </h3>
                                    <p className="text-xs">Time to traverse</p>
                                </div>
                            )}
                            {time.distanceKm !== null && (
                                <div>
                                    <p className="text-xl font-semibold">
                                        {`${time.distanceKm.toFixed(2)} km`}
                                    </p>
                                    <p className="text-xs">Distance of route</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Placeholder Text - shown when no calculation has been done yet */
                        <p className="italic">Enter details and calculate to see travel time and distance.</p>
                    )}
                </>
            )}
        </div>
    );
}
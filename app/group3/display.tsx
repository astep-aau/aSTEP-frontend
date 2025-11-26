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
        <div className="p-4 w-full text-center">
            {error ? (
                /* Show all validation/API errors */
                renderErrors(error)
            ) : (
                <>
                    {/* Loading Spinner Section - shown while time calculation is in progress */}
                    {loading ? (
                        <div className="flex items-center justify-center rounded-lg mb-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-3 text-lg font-medium">Calculating time...</span>
                        </div>
                    ) : time.hours !== null ? (
                        /* Travel Time Display - shown when calculation completes */
                        <>
                            <h3 className="text-xl font-bold mb-1">
                                {`${time.hours}h ${time.minutes ?? 0}m`}
                            </h3>
                            <p className="text-sm italic">Time in hours, minutes</p>
                        </>
                    ) : !time.distanceKm ? (
                        /* Placeholder Text - only shown when nothing has been calculated yet */
                        <p className="text-sm p-7">Enter route details and click Calculate</p>
                    ) : null}

                    {/* Distance Display - shown immediately when available (even during loading)
                        Distance is typically received before time calculation completes,
                        so we show it independently to improve UX */}
                    {time.distanceKm !== null && (
                        <div className="mt-3">
                            <p className="text-lg font-semibold">
                                {`${time.distanceKm.toFixed(2)} km`}
                            </p>
                            <p className="text-xs">Distance</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
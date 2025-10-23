import React from 'react';
import { EstimatedTimeState } from "./page";

interface DisplayProps {
    time: EstimatedTimeState;
    error: EstimatedTimeState['error'];
    loading: boolean;
}

export function Display({ time, error, loading }: DisplayProps) {
    // Helper to render all error messages
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
        <div className="p-6 w-full text-center">
            {error ? (
                renderErrors(error)
            ) : loading ? (
                <p className="text-blue-600 font-semibold">Calculating...</p>
            ) : time.hours !== null ? (
                <>
                    <h3 className="text-xl font-bold mb-1">
                        {`${time.hours}h ${time.minutes ?? 0}m ${time.seconds ?? 0}s`}
                    </h3>
                    <p className="text-sm italic">Time in hours, minutes, seconds</p>
                </>
            ) : (
                <p className="text-sm text-gray-500">Enter route details and click Calculate</p>
            )}
        </div>
    );
}
import React from 'react';
import { EstimatedTimeState } from "./page"; 

interface DisplayProps {
    time: EstimatedTimeState;
    error: string | null;
    loading: boolean;
}

// Component to display the estimated travel time.
export function Display({ time, error, loading }: DisplayProps) {
    const travelTimeRecieved = false; // Placeholder condition

    if (travelTimeRecieved) {
        return (
            <div className="rounded-lg border border-gray-200 p-4 w-full shadow-sm text-center">
                {loading && <p className="text-blue-500 font-semibold">Calculating...</p>}
                {error && <p className="text-red-500 font-semibold">Error: {error}</p>}
                {!loading && !error && time.hours !== null ? (
                    <h3 className="text-xl font-bold mb-1">
                        {`${time.hours}h ${time.minutes}m ${time.seconds}s`}
                    </h3>
                ) : (
                    <h3 className="text-lg font-semibold mb-1">Estimated travel time</h3>
                )}
                <p className="text-sm italic">Time in hours, minutes, seconds</p>
            </div>
        );
    }

    return <div className="rounded-lg p-4 w-full" />;
}
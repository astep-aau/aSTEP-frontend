"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, CircleQuestionMark } from "lucide-react"; 
import { IconButton } from "./iconButton";
import { FormEvent, useState } from 'react';
import { EstimatedTimeState } from "./page";
import { Input } from '@/components/ui/input';
import { Display } from "./display";

interface InputPanelProps {
    origin: string;
    setOrigin: (value: string) => void;
    destination: string;
    setDestination: (value: string) => void;
    timeOfTravel: string;
    setTimeOfTravel: (value: string) => void;
    modelVersion: string;
    setModelVersion: (value: string) => void;
    estimatedTime: EstimatedTimeState;
    handleCalculate: () => Promise<void>;
    modelVersions: string[];
    pageName: string;
}

// Main Input Panel Component (Form)
export function InputPanel({ 
    origin, setOrigin, 
    destination, setDestination, 
    timeOfTravel, setTimeOfTravel,
    modelVersion, setModelVersion, 
    estimatedTime, handleCalculate,
    modelVersions, pageName
}: InputPanelProps) {
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleCalculate();
  };

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const helpButtonPressed = () => {
    console.log("Help button pressed");
    setIsHelpOpen(prev => !prev);
  };

  return (
    <form onSubmit={onSubmit} className="w-full h-full flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-xl">
      {/* Title */}
      <div className="relative mb-2">
        <h2 className="text-xl font-bold text-center text-decoration: underline">{pageName}</h2>
       
      {/* Help Button */} 
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <IconButton label="Help" onClick={helpButtonPressed}>
            <CircleQuestionMark className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      {/* Origin Input */}
      <div className="space-y-1">
        <label htmlFor="origin" className="text-sm font-medium block">Start position (lon, lat)</label>
        <div className="relative">
          <Input
            id="origin"
            name="origin"
            placeholder="e.g., 126.63, 45.75"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            <IconButton label="Open map picker" onClick={() => {/* call function */}}>
              <MapPin className="h-4 w-4 " />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Destination Input */}
      <div className="space-y-1">
        <label htmlFor="destination" className="text-sm font-medium block">Destination (lon, lat)</label>
        <div className="relative">
          <Input
            id="destination"
            name="destination"
            placeholder="e.g., 126.54, 45.80"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            <IconButton label="Open map picker" onClick={() => {/* call function */}}>
              <MapPin className="h-4 w-4 " />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Time of Travel Input */}
      <div className="space-y-1">
        <label htmlFor="timeOfTravel" className="text-sm font-medium block">Time of travel</label>
        <Input
          id="timeOfTravel"
          name="timeOfTravel"
          placeholder="e.g., 14:00"
          value={timeOfTravel}
          onChange={(e) => setTimeOfTravel(e.target.value)}
        />
      </div>

      {/* Model Select */}
      <div className="space-y-1">
        <label htmlFor="modelVersion" className="text-sm font-medium block" >Model version</label>
        <select
          id="modelVersion"
          name="modelVersion"
          value={modelVersion}
          onChange={(e) => setModelVersion(e.target.value)}
          className="w-full rounded-md border px-3 py-2 cursor-pointer "
        >
          {modelVersions.map((v) => (
            <option key={v} value={v}>{v} </option>
          ))}
        </select>
      </div>

      {/* Calculate Button */}
      <Button
        type="submit"
        className="mt-4 w-full font-semibold transition duration-200 shadow-lg cursor-pointer hover:shadow-xl"
        size="lg"
        disabled={estimatedTime.loading}
        variant={"secondary"}
      >
        {estimatedTime.loading ? "Calculating..." : "Calculate travel time"}
      </Button>

      <Separator className="mt-4 mb-2 bg-gray-200" />

      {/* Estimated Travel Time Display */}
      <Display
        time={estimatedTime}
        error={estimatedTime.error}
        loading={estimatedTime.loading}
      />
    </form>
  );
}

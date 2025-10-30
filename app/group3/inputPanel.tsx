"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, CircleQuestionMark } from "lucide-react";
import { IconButton } from "./iconButton";
import { FormEvent } from "react";
import { EstimatedTimeState } from "./page";
import { Input } from '@/components/ui/input';
import { Display } from "./display";
import { flushSync } from "react-dom";

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
    help: boolean;
    setHelp: (value: boolean) => void;
    pageName: string;
    onOriginMapClick: () => void;
    onDestinationMapClick: () => void;
    activeMapPicker: 'origin' | 'destination' | null;
}

// Main Input Panel Component (Form)
export function InputPanel({
    origin, setOrigin,
    destination, setDestination,
    timeOfTravel, setTimeOfTravel,
    modelVersion, setModelVersion,
    estimatedTime, handleCalculate,
    modelVersions, 
    pageName, 
    help, setHelp,
    onOriginMapClick,
    onDestinationMapClick,
    activeMapPicker
}: InputPanelProps) {
  
  // sanitize spaces helper: remove all whitespace characters
  const removeSpaces = (s: string) => s.replace(/\s+/g, "");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Remove spaces from the inputs before sending
    const cleanOrigin = removeSpaces(origin);
    const cleanDestination = removeSpaces(destination);
    const cleanTime = removeSpaces(timeOfTravel);

    // Ensure parent state is updated synchronously before calling handleCalculate
    flushSync(() => {
      setOrigin(cleanOrigin);
      setDestination(cleanDestination);
      setTimeOfTravel(cleanTime);
    });

    await handleCalculate();
  };

  // Toggle the parent-controlled help state so VisualPanel will show/hide help
  const helpButtonPressed = () => {
    setHelp(!help);
  };

  //------------ Sanitize Numeric Input Handlers ------------//
  const isPrintableKey = (key: string) => key.length === 1;

  const numericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow modifier combos (copy/paste, shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Allow non-printable keys (Arrow keys, Backspace, Delete, Home, End, Tab, Enter, F-keys, etc.)
    if (!isPrintableKey(e.key)) return;
    // For printable single-character keys, allow only digits, comma, dot or space
    if (!/^[0-9.,: ]$/.test(e.key)) e.preventDefault();
  };

  // Make a paste-handler tied to the specific setter to sanitize pasted text
  const makePasteHandler =
    (setter: (v: string) => void) =>
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text");
      const sanitized = pasted.replace(/[^0-9., ]+/g, "");
      if (sanitized !== pasted) {
        e.preventDefault();
        // Insert sanitized text at the cursor position and call the setter
        const el = e.currentTarget as HTMLInputElement;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const newVal = el.value.slice(0, start) + sanitized + el.value.slice(end);
        setter(newVal);
      }
    };
    //------------ End Sanitize Numeric Input Handlers ------------//

  return (
    <form onSubmit={onSubmit} className="w-full h-full flex flex-col gap-5 p-6 rounded-lg border shadow-lg overflow-y-auto">
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
        <label htmlFor="origin" className="text-sm font-medium block">Start position (lat, lon)</label>
        <div className="relative">
          <Input
            id="origin"
            name="origin"
            placeholder="e.g., 45.75, 126.63"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className={cn(
                "pr-12",
                estimatedTime.error?.origin && "border-red-500 focus-visible:ring-red-500"
            )}
            pattern="^[0-9.,: ]*$"
            onKeyDown={numericKeyDown}
            inputMode="decimal"
            onPaste={makePasteHandler(setOrigin)}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            <IconButton label="Open map picker" onClick={onOriginMapClick}>
              <MapPin className={cn(
                "h-4 w-4",
                activeMapPicker === 'origin'
              )} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Destination Input */}
      <div className="space-y-1">
        <label htmlFor="destination" className="text-sm font-medium block">Destination (lat, lon)</label>
        <div className="relative">
          <Input
            id="destination"
            name="destination"
            placeholder="e.g., 45.80, 126.54"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={cn(
                "pr-12",
                estimatedTime.error?.destination && "border-red-500 focus-visible:ring-red-500"
            )}
            pattern="^[0-9.,: ]*$"
            onKeyDown={numericKeyDown}
            inputMode="decimal"
            onPaste={makePasteHandler(setDestination)}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            <IconButton label="Open map picker" onClick={onDestinationMapClick}>
              <MapPin className={cn(
                "h-4 w-4",
                activeMapPicker === 'destination' 
              )} />
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
          className={cn(
              estimatedTime.error?.time && "border-red-500 focus-visible:ring-red-500"
          )}
          pattern="^[0-9.,: ]*$"
          onKeyDown={numericKeyDown}
          inputMode="decimal"
          onPaste={makePasteHandler(setTimeOfTravel)}
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
          className="w-full rounded-md border px-2 py-2 cursor-pointer "
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
        disabled={estimatedTime.displayLoading}
        variant={"secondary"}
      >
        {estimatedTime.displayLoading ? "Calculating.." : "Calculate travel time"}
      </Button>

      <Separator className="mt-2 mb-2" />

      {/* Estimated Travel Time Display */}
      <Display
        time={estimatedTime}
        error={estimatedTime.error}
        loading={estimatedTime.displayLoading}
      />
    </form>
  );
}
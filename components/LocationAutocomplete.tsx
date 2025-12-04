"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

//
// Types for Nominatim API
//
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  onSelect: (location: { name: string; lat: number; lon: number }) => void;
  placeholder?: string;
}

//
// Debounce utility
//
function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

//
// Main component
//
export function LocationAutocomplete({
  onSelect,
  placeholder = "Search city...",
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const debouncedSearch = useDebounce(search);

  //
  // Fetch cities from Nominatim API
  //
  const fetchLocations = useCallback(async (query: string) => {
    if (!query || query.length < 2) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query,
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "big-data-main",
        },
      });

      if (!res.ok) return;

      const data: NominatimResult[] = await res.json();
      setResults(data.slice(0, 8)); // limit results
    } catch (err) {
      console.error("Location fetch failed:", err);
    }
  }, []);

  //
  // Fetch when the debounced value changes
  //
  useEffect(() => {
    fetchLocations(debouncedSearch);
  }, [debouncedSearch, fetchLocations]);

  //
  // Handle selecting a city
  //
  const handleSelect = (item: NominatimResult) => {
    onSelect({
      name: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
    });

    setOpen(false);
    setSearch(item.display_name);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {search || placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[350px]">
        <Command>
          <CommandInput
            placeholder="Type a city..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>

            {results.map((item) => (
              <CommandItem
                key={item.place_id}
                value={item.display_name}
                onSelect={() => handleSelect(item)}
              >
                {item.display_name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

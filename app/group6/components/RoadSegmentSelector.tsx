'use client';

import { useState } from 'react';
import { Check, 
  ChevronsUpDown 
} from 'lucide-react';
import { Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Road } from '../services/imputation'; 

interface RoadSegmentSelectorProps {
  roads: Road[]; 
  selectedRoadId: string | null;
  onSelect: (roadId: string) => void;
  loading?: boolean;
}

export default function RoadSegmentSelector({
  roads,
  selectedRoadId,
  onSelect,
  loading = false,
}: RoadSegmentSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedRoad = roads.find(r => r.road_id === selectedRoadId);

  return (
    <div className="grid space-y-2">
      <label className="text-sm font-medium">Road Segment</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[255px] justify-between"
            disabled={loading}
          >
            {selectedRoad ? (
              <span>
                {selectedRoad.name || selectedRoad.road_id}
                {selectedRoad.road_type && ` (${selectedRoad.road_type})`}
              </span>
            ) : (
              <span className="">Select road segment...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-md border shadow-md p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-60 overflow-auto p-2 space-y-1">
            {roads.map((road) => (
              <div
                key={road.road_id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent",
                  selectedRoadId === road.road_id && "bg-accent"
                )}
                onClick={() => {
                  onSelect(road.road_id);
                  setOpen(false);
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{road.name || road.road_id}</div>
                  {road.road_type && (
                    <div className="text-xs text-muted-foreground">{road.road_type}</div>
                  )}
                </div>
                {selectedRoadId === road.road_id && <Check className="h-4 w-4 text-primary" />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
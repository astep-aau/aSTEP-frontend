'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimeRange } from '../services/imputation';

interface TimeIntervalSelectorProps {
  availableRange: TimeRange; 
  selectedRange: TimeRange;
  onSelect: (range: TimeRange) => void;
}

export default function TimeIntervalSelector({
  availableRange,
  selectedRange,
  onSelect,
}: TimeIntervalSelectorProps) {
  const [localStart, setLocalStart] = useState(selectedRange.start);
  const [localEnd, setLocalEnd] = useState(selectedRange.end);

  const presets = [
    {
      label: 'Last 24h',
      getValue: () => {
        const end = new Date(availableRange.end);
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        return { start: start.toISOString(), end: end.toISOString() };
      },
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const end = new Date(availableRange.end);
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: start.toISOString(), end: end.toISOString() };
      },
    },
    {
      label: 'Full Range',
      getValue: () => availableRange,
    },
  ];

  const handleApply = () => {
    onSelect({ start: localStart, end: localEnd });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Time Interval</label>

      {/* Preset buttons */}
      <div className="flex gap-2 flex-wrap">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => {
              const range = preset.getValue();
              setLocalStart(range.start);
              setLocalEnd(range.end);
              onSelect(range);
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Manual inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Start</label>
          <Input
            type="datetime-local"
            value={localStart.slice(0, 16)} // ISO format for datetime-local
            onChange={(e) => setLocalStart(new Date(e.target.value).toISOString())}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">End</label>
          <Input
            type="datetime-local"
            value={localEnd.slice(0, 16)}
            onChange={(e) => setLocalEnd(new Date(e.target.value).toISOString())}
          />
        </div>
      </div>

      <Button onClick={handleApply} className="w-full" size="sm">
        Apply Time Range
      </Button>
    </div>
  );
}
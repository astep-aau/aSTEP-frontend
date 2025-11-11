'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  markerMode: 'start' | 'end' | null
  startAddress: string
  endAddress: string
  onMarkerModeChange: (mode: 'start' | 'end') => void
}

export function LocationPicker({
  markerMode,
  startAddress,
  endAddress,
  onMarkerModeChange
}: LocationPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <Button
          onClick={() => onMarkerModeChange('start')}
          variant={markerMode === 'start' ? 'default' : 'outline'}
          size="icon"
          className={markerMode === 'start' ? 'bg-green-600 hover:bg-green-700' : ''}
          title="Set start point"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={startAddress}
          placeholder="Click marker button, then click map to set start point"
          readOnly
          className="flex-1"
        />
      </div>
      <div className="flex gap-3 items-center">
        <Button
          onClick={() => onMarkerModeChange('end')}
          variant={markerMode === 'end' ? 'default' : 'outline'}
          size="icon"
          className={markerMode === 'end' ? 'bg-red-600 hover:bg-red-700' : ''}
          title="Set end point"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={endAddress}
          placeholder="Click marker button, then click map to set end point"
          readOnly
          className="flex-1"
        />
      </div>
    </div>
  )
}

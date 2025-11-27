'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface TimePickerCardProps {
  timeType: 'departure' | 'arrival'
  selectedTime: string
  onTimeTypeChange: (value: string) => void
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function TimePickerCard({
  timeType,
  selectedTime,
  onTimeTypeChange,
  onTimeChange
}: TimePickerCardProps) {
  return (
    <Card className="w-full max-w-72 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Travel Time</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={timeType} onValueChange={onTimeTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="departure">Departure</TabsTrigger>
            <TabsTrigger value="arrival">Arrival</TabsTrigger>
          </TabsList>
          <TabsContent value="departure" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="departure-time">Time</Label>
              <Input
                id="departure-time"
                type="text"
                value={selectedTime}
                onChange={onTimeChange}
                placeholder="hh:mm"
                maxLength={5}
              />
            </div>
          </TabsContent>
          <TabsContent value="arrival" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="arrival-time">Time</Label>
              <Input
                id="arrival-time"
                type="text"
                value={selectedTime}
                onChange={onTimeChange}
                placeholder="hh:mm"
                maxLength={5}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

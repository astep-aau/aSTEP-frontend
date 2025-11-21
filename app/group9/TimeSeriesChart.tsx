"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, ReferenceArea } from "recharts"
import { ChartDataItem } from "./types"
import { AnomalyRange } from "./types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

export const description = "An interactive line chart with anomaly highlighting"

const chartConfig = {
  time: {
    label: "Datetime",
  },
  value: {
    label: "Value",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig

interface TimeSeriesChartProps {
  chartData: ChartDataItem[]
  anomalyRanges?: AnomalyRange[]
}

export default function TimeSeriesChart({ 
  chartData, 
  anomalyRanges = [] 
}: TimeSeriesChartProps) {
  const [startIndex, setStartIndex] = React.useState(0)
  const [endIndex, setEndIndex] = React.useState(Math.min(100, chartData.length - 1))
  const chartRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    console.log("Chart data sample:", chartData.slice(0, 3))
    console.log("Anomaly ranges:", anomalyRanges)
  }, [chartData, anomalyRanges])

  // Handle mouse wheel zoom with mouse position awareness
  const handleWheel = React.useCallback((e: WheelEvent) => {
    if (!chartRef.current?.contains(e.target as Node)) return
    
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.8 : 1.2 // Zoom out or in
    
    // Get the chart container bounds
    const chartContainer = chartRef.current
    if (!chartContainer) return
    
    const rect = chartContainer.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const chartWidth = rect.width
    
    // Calculate position as a percentage (0-1) within the chart
    const mousePercent = Math.max(0, Math.min(1, mouseX / chartWidth))
    
    setStartIndex(prev => {
      const newStart = prev
      const currentEnd = endIndex
      const range = currentEnd - newStart
      const newRange = Math.max(10, Math.min(chartData.length - 1, range / zoomFactor))
      
      // Calculate new start based on mouse position
      const zoomCenter = newStart + range * mousePercent
      const adjustedStart = Math.max(0, Math.floor(zoomCenter - newRange * mousePercent))
      
      return adjustedStart
    })
    
    setEndIndex(prev => {
      const currentStart = startIndex
      const newStart = currentStart
      const range = prev - newStart
      const newRange = Math.max(10, Math.min(chartData.length - 1, range / zoomFactor))
      
      // Calculate new end based on mouse position and new start
      const rect = chartRef.current?.getBoundingClientRect()
      if (!rect) return prev
      
      const mouseX = e.clientX - rect.left
      const chartWidth = rect.width
      const mousePercent = Math.max(0, Math.min(1, mouseX / chartWidth))
      
      const zoomCenter = newStart + range * mousePercent
      const adjustedStart = Math.max(0, Math.floor(zoomCenter - newRange * mousePercent))
      const adjustedEnd = Math.min(chartData.length - 1, adjustedStart + Math.floor(newRange))
      
      setStartIndex(adjustedStart)
      return adjustedEnd
    })
  }, [chartData.length, startIndex, endIndex])

  React.useEffect(() => {
    const ref = chartRef.current
    if (ref) {
      ref.addEventListener("wheel", handleWheel as EventListener, { passive: false })
      return () => ref.removeEventListener("wheel", handleWheel as EventListener)
    }
  }, [handleWheel])

  const handleReset = () => {
    setStartIndex(0)
    setEndIndex(Math.min(100, chartData.length - 1))
  }

  // Filter chart data based on zoom indices
  const visibleData = React.useMemo(
    () => chartData.slice(startIndex, endIndex + 1),
    [chartData, startIndex, endIndex]
  )

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Line Chart - Interactive</CardTitle>
          <CardDescription>
            Showing data values over time with anomaly detection (scroll to zoom, click reset)
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 px-6 pb-3 sm:pb-0">
          <Button
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs"
          >
            Reset Zoom
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div ref={chartRef} className="w-full">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={visibleData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="value"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              
              {/* Highlight anomaly regions */}
              {anomalyRanges.map((anomaly, index) => (
                <ReferenceArea
                  key={index}
                  x1={anomaly.start}
                  x2={anomaly.end}
                  strokeOpacity={0.3}
                  fill="red"
                  fillOpacity={0.5}
                  label={anomaly.label}
                />
              ))}
              
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
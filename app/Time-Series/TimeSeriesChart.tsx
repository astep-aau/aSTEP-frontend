"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, ReferenceArea } from "recharts"
import { ChartDataItem } from "../Time-Series/types"
import { AnomalyRange } from "../Time-Series/types"

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
  const [endIndex, setEndIndex] = React.useState<number | null>(null)
  const [displayStartIndex, setDisplayStartIndex] = React.useState(0)
  const [displayEndIndex, setDisplayEndIndex] = React.useState<number | null>(null)
  const [isPanning, setIsPanning] = React.useState(false)
  const [panStartX, setPanStartX] = React.useState(0)
  const [panStartIndices, setPanStartIndices] = React.useState({ start: 0, end: 0 })
  const [isSliderDragging, setIsSliderDragging] = React.useState<'left' | 'right' | 'middle' | null>(null)
  const [sliderDragStart, setSliderDragStart] = React.useState({ x: 0, startIdx: 0, endIdx: 0 })
  const chartRef = React.useRef<HTMLDivElement>(null)
  const sliderRef = React.useRef<HTMLDivElement>(null)
  const animationFrameRef = React.useRef<number | null>(null)
  const lastMouseXRef = React.useRef<number>(0)

  // Update endIndex when chartData changes
  React.useEffect(() => {
    if (chartData.length > 0) {
      setEndIndex(chartData.length - 1)
      setDisplayEndIndex(chartData.length - 1)
    }
  }, [chartData.length])

  // Sync display indices with actual indices (for chart rendering) with a slight delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setStartIndex(displayStartIndex)
      if (displayEndIndex !== null) {
        setEndIndex(displayEndIndex)
      }
    }, 16) // ~1 frame delay
    
    return () => clearTimeout(timer)
  }, [displayStartIndex, displayEndIndex])

  React.useEffect(() => {
    console.log("Chart data sample:", chartData.slice(0, 3))
    console.log("Anomaly ranges:", anomalyRanges)
  }, [chartData, anomalyRanges])

  // Handle mouse wheel zoom with mouse position awareness
  const handleWheel = React.useCallback((e: WheelEvent) => {
    if (!chartRef.current?.contains(e.target as Node) || endIndex === null) return
    
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
    
    const currentStart = startIndex
    const currentEnd = endIndex
    const range = currentEnd - currentStart
    const newRange = Math.max(10, Math.min(chartData.length - 1, range / zoomFactor))
    
    // Calculate new start based on mouse position
    const zoomCenter = currentStart + range * mousePercent
    const adjustedStart = Math.max(0, Math.floor(zoomCenter - newRange * mousePercent))
    const adjustedEnd = Math.min(chartData.length - 1, adjustedStart + Math.floor(newRange))
    
    setStartIndex(adjustedStart)
    setEndIndex(adjustedEnd)
    setDisplayStartIndex(adjustedStart)
    setDisplayEndIndex(adjustedEnd)
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
    setDisplayStartIndex(0)
    if (chartData.length > 0) {
      setEndIndex(chartData.length - 1)
      setDisplayEndIndex(chartData.length - 1)
    }
  }

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!chartRef.current?.contains(e.target as Node) || endIndex === null || isSliderDragging) return
    setIsPanning(true)
    setPanStartX(e.clientX)
    setPanStartIndices({ start: startIndex, end: endIndex })
  }, [startIndex, endIndex, isSliderDragging])

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!isPanning || endIndex === null || !chartRef.current) return

    const deltaX = e.clientX - panStartX
    const chartWidth = chartRef.current.offsetWidth
    const range = panStartIndices.end - panStartIndices.start
    const pixelsPerPoint = chartWidth / range

    // Calculate how many points to shift based on mouse movement
    const pointShift = Math.round(-deltaX / pixelsPerPoint)

    const newStart = Math.max(0, Math.min(panStartIndices.start + pointShift, chartData.length - range - 1))
    const newEnd = Math.min(newStart + range, chartData.length - 1)

    setStartIndex(newStart)
    setEndIndex(newEnd)
    setDisplayStartIndex(newStart)
    setDisplayEndIndex(newEnd)
  }, [isPanning, panStartX, panStartIndices, endIndex, chartData.length])

  const handleMouseUp = React.useCallback(() => {
    if (!isSliderDragging) {
      setIsPanning(false)
    }
  }, [isSliderDragging])

  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp as EventListener)
    return () => document.removeEventListener('mouseup', handleMouseUp as EventListener)
  }, [handleMouseUp])

  // Slider interaction handlers
  const handleSliderMouseDown = React.useCallback((e: React.MouseEvent, type: 'left' | 'right' | 'middle') => {
    if (displayEndIndex === null || !sliderRef.current) return
    e.stopPropagation()
    e.preventDefault()
    setIsSliderDragging(type)
    setSliderDragStart({ x: e.clientX, startIdx: displayStartIndex, endIdx: displayEndIndex })
  }, [displayStartIndex, displayEndIndex])

  const handleSliderMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isSliderDragging || displayEndIndex === null || !sliderRef.current) return

    e.preventDefault()
    lastMouseXRef.current = e.clientX

    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Use requestAnimationFrame to throttle updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaX = lastMouseXRef.current - sliderDragStart.x
      const sliderWidth = sliderRef.current?.offsetWidth || 1
      const deltaPercent = (deltaX / sliderWidth) * 100
      const deltaPoints = Math.round((deltaPercent / 100) * chartData.length)

      if (isSliderDragging === 'left') {
        // Adjust start index (left edge) - update display immediately
        const newStart = Math.max(0, Math.min(sliderDragStart.startIdx + deltaPoints, sliderDragStart.endIdx - 10))
        if (newStart !== displayStartIndex) {
          setDisplayStartIndex(newStart)
        }
      } else if (isSliderDragging === 'right') {
        // Adjust end index (right edge) - update display immediately
        const newEnd = Math.max(sliderDragStart.startIdx + 10, Math.min(sliderDragStart.endIdx + deltaPoints, chartData.length - 1))
        if (newEnd !== displayEndIndex) {
          setDisplayEndIndex(newEnd)
        }
      } else if (isSliderDragging === 'middle') {
        // Move the entire window - update display immediately
        const range = sliderDragStart.endIdx - sliderDragStart.startIdx
        let newStart = sliderDragStart.startIdx + deltaPoints
        
        // Keep within bounds
        if (newStart < 0) newStart = 0
        if (newStart + range > chartData.length - 1) newStart = chartData.length - 1 - range
        
        const newEnd = newStart + range
        
        if (newStart !== displayStartIndex || newEnd !== displayEndIndex) {
          setDisplayStartIndex(newStart)
          setDisplayEndIndex(newEnd)
        }
      }
    })
  }, [isSliderDragging, sliderDragStart, displayEndIndex, displayStartIndex, chartData.length])

  const handleSliderMouseUp = React.useCallback(() => {
    setIsSliderDragging(null)
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => handleSliderMouseMove(e)
    const handleUp = () => handleSliderMouseUp()
    
    if (isSliderDragging) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }
    }
  }, [isSliderDragging, handleSliderMouseMove, handleSliderMouseUp])

  // Filter chart data based on zoom indices
  const visibleData = React.useMemo(
    () => endIndex !== null ? chartData.slice(startIndex, endIndex + 1) : [],
    [chartData, startIndex, endIndex]
  )

  // Create a minimap indicator showing anomaly locations across entire dataset
  const anomalyIndicators = React.useMemo(() => {
    if (anomalyRanges.length === 0 || chartData.length === 0) return [];
    
    return anomalyRanges.map((anomaly, index) => {
      // Find indices for anomaly start and end in the full dataset
      const startIdx = chartData.findIndex(d => d.date === anomaly.start);
      const endIdx = chartData.findIndex(d => d.date === anomaly.end);
      
      if (startIdx === -1 || endIdx === -1) return null;
      
      const startPercent = (startIdx / chartData.length) * 100;
      const endPercent = ((endIdx + 1) / chartData.length) * 100;
      const width = endPercent - startPercent;
      
      return {
        key: index,
        left: startPercent,
        width: width,
        label: anomaly.label
      };
    }).filter((item) => item !== null) as Array<{ key: number; left: number; width: number; label?: string }>;
  }, [anomalyRanges, chartData])

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
        <div 
          ref={chartRef} 
          className="w-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
        >
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
                    className="w-[200px]"
                    nameKey="value"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
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
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
        
        {/* Anomaly indicator bar */}
        {chartData.length > 0 && (
          <div className="mt-4 w-full">
            <p className="text-xs text-gray-600 mb-2">
              {anomalyIndicators.length > 0 ? 'Anomaly Overview (entire dataset):' : 'Dataset Overview:'}
            </p>
            <div 
              ref={sliderRef}
              className="w-full h-6 bg-gray-200 rounded relative overflow-visible border border-gray-300 select-none"
            >
              {anomalyIndicators.map((indicator) => (
                <div
                  key={indicator.key}
                  className="absolute h-full bg-red-500 hover:bg-red-600 transition-colors"
                  style={{
                    left: `${indicator.left}%`,
                    width: `${indicator.width}%`,
                  }}
                  title={indicator.label || 'Anomaly'}
                />
              ))}
              
              {/* Current view indicator with draggable edges */}
              {displayEndIndex !== null && (
                <>
                  {/* Main window */}
                  <div
                    className="absolute top-0 h-full bg-blue-300 opacity-50 cursor-move select-none"
                    style={{
                      left: `${(displayStartIndex / chartData.length) * 100}%`,
                      right: `${100 - ((displayEndIndex + 1) / chartData.length) * 100}%`,
                    }}
                    onMouseDown={(e) => handleSliderMouseDown(e, 'middle')}
                  />
                  
                  {/* Left edge handle */}
                  <div
                    className="absolute top-0 h-full w-2 bg-blue-500 hover:bg-blue-600 cursor-ew-resize z-10"
                    style={{
                      left: `${(displayStartIndex / chartData.length) * 100}%`,
                    }}
                    onMouseDown={(e) => handleSliderMouseDown(e, 'left')}
                    title="Drag to adjust start"
                  />
                  
                  {/* Right edge handle */}
                  <div
                    className="absolute top-0 h-full w-2 bg-blue-500 hover:bg-blue-600 cursor-ew-resize z-10"
                    style={{
                      left: `calc(${((displayEndIndex + 1) / chartData.length) * 100}% - 0.5rem)`,
                    }}
                    onMouseDown={(e) => handleSliderMouseDown(e, 'right')}
                    title="Drag to adjust end"
                  />
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
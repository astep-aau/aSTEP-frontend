'use client';

import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Brush,
} from 'recharts';
import { ChartDataPoint } from '../lib/chart-utils';
import {
    CHART_COLORS,
    CHART_DIMENSIONS,
    LINE_STYLES,
    formatSpeed,
    formatTimestamp,
} from '../lib/chart.config';
import { Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

export type ChartMode = 'single' | 'comparison' | 'configurations' | 'error';

interface TimeSeriesChartProps {
    data: ChartDataPoint[];
    mode?: ChartMode;
    onModeChange?: (mode: ChartMode) => void;
    modelNames?: string[];
}

/**
 * Shows detailed information on hover
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
            <p className="font-semibold mb-2 text-sm">
                {formatTimestamp(label)}
            </p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                        {entry.name}:
                    </span>
                    <span className="font-medium">
                        {formatSpeed(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

/**
 * Mode 1: Single Model vs Observed
 */
function SingleModelChart({ data }: { data: ChartDataPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.defaultHeight}>
            <LineChart
                data={data}
                margin={CHART_DIMENSIONS.margin}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />

                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => formatTimestamp(value)}
                    stroke={CHART_COLORS.text}
                />

                <YAxis
                    label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }}
                    stroke={CHART_COLORS.text}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend />

                {/* Observed data (blue solid line) */}
                <Line
                    type="monotone"
                    dataKey="observed"
                    stroke={CHART_COLORS.observed}
                    name="Observed"
                    {...LINE_STYLES.observed}
                />

                {/* Imputed data (orange solid line) */}
                <Line
                    type="monotone"
                    dataKey="imputed"
                    stroke={CHART_COLORS.imputed}
                    name="Imputed"
                    {...LINE_STYLES.imputed}
                />

                {/* Brush for zooming/panning */}
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke={CHART_COLORS.observed}
                >
                    <LineChart>
                        <Line type="monotone" dataKey="imputed" stroke={CHART_COLORS.imputed} dot={false} />
                    </LineChart>
                </Brush>
            </LineChart>
        </ResponsiveContainer>
    );
}

/**
 * Mode 2: Compare Two Models
 */
function ComparisonChart({ data, modelNames }: { data: ChartDataPoint[], modelNames: string[] }) {
    return (
        <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.defaultHeight}>
            <LineChart data={data} margin={CHART_DIMENSIONS.margin}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} />
                <YAxis label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Observed (solid blue) */}
                <Line
                    type="monotone"
                    dataKey="observed"
                    stroke={CHART_COLORS.observed}
                    name="Observed"
                    {...LINE_STYLES.observed}
                />

                {/* Model 1 (dashed orange) */}
                <Line
                    type="monotone"
                    dataKey="imputed"
                    stroke={CHART_COLORS.model1}
                    name={modelNames[0] || 'Model 1'}
                    {...LINE_STYLES.comparison}
                />

                {/* Model 2 (dashed green) */}
                <Line
                    type="monotone"
                    dataKey="imputed2"
                    stroke={CHART_COLORS.model2}
                    name={modelNames[1] || 'Model 2'}
                    {...LINE_STYLES.comparison}
                />

                <Brush dataKey="timestamp" height={30} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function ConfigurationsChart({ data, modelNames }: { data: ChartDataPoint[], modelNames: string[] }) {
  // Calculate opacity for each model (best = 1.0, worst = 0.3)
  const opacities = modelNames.map((_, index) =>
    1.0 - (index / Math.max(modelNames.length - 1, 1)) * 0.7
  );

  return (
    <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.defaultHeight}>
      <LineChart data={data} margin={CHART_DIMENSIONS.margin}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} />
        <YAxis label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {/* Observed */}
        <Line
          type="monotone"
          dataKey="observed"
          stroke={CHART_COLORS.observed}
          name="Observed"
          {...LINE_STYLES.observed}
        />

        {/* Multiple model predictions with varying opacity */}
        <Line
          type="monotone"
          dataKey="imputed"
          stroke={CHART_COLORS.imputed}
          strokeOpacity={opacities[0]}
          name={modelNames[0] || 'Best Model'}
          {...LINE_STYLES.imputed}
        />

        {data[0]?.imputed2 && (
          <Line
            type="monotone"
            dataKey="imputed2"
            stroke={CHART_COLORS.imputed}
            strokeOpacity={opacities[1]}
            name={modelNames[1]}
            {...LINE_STYLES.imputed}
          />
        )}

        {data[0]?.imputed3 && (
          <Line
            type="monotone"
            dataKey="imputed3"
            stroke={CHART_COLORS.imputed}
            strokeOpacity={opacities[2]}
            name={modelNames[2]}
            {...LINE_STYLES.imputed}
          />
        )}

        <Brush dataKey="timestamp" height={30} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Main TimeSeriesChart Component
 */
export default function TimeSeriesChart({
    data,
    mode = 'single',
    onModeChange,
    modelNames = [],
}: TimeSeriesChartProps) {
    // Memoize and sanitize incoming data so Recharts doesn't receive NaN/undefined
    const chartData = useMemo(() => {
      return data
        .map((d: any) => ({
          ...d,
          // Keep timestamp as ISO string (chart-utils produces ISO strings)
          timestamp: d.timestamp,
          // Validate timestamp by attempting to parse it; we'll filter invalid ones below
          _timestampValid: !Number.isNaN(Date.parse(d.timestamp)),
          observed: d.observed === undefined || d.observed === null ? null : Number(d.observed),
          imputed: d.imputed === undefined || d.imputed === null ? null : Number(d.imputed),
          imputed2: d.imputed2 === undefined || d.imputed2 === null ? null : Number(d.imputed2),
          imputed3: d.imputed3 === undefined || d.imputed3 === null ? null : Number(d.imputed3),
          error: d.error === undefined || d.error === null ? undefined : Number(d.error),
        }))
        // Remove points with invalid timestamps
        .filter((d: any) => d._timestampValid)
        // Remove internal helper flag before returning
        .map((d: any) => {
          const { _timestampValid, ...rest } = d;
          return rest;
        });
    }, [data]);

    // If no valid data after sanitization, render an empty chart shell so the UI stays visible
    if (!chartData || chartData.length === 0) {
      return (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.defaultHeight}>
            <LineChart data={[]}> 
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} stroke={CHART_COLORS.text} />
              <YAxis label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} stroke={CHART_COLORS.text} />
            </LineChart>
          </ResponsiveContainer>
          <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
            No valid chart data available for the selected options.
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
            {/* Mode Selector */}
            <Tabs value={mode} onValueChange={(v) => onModeChange?.(v as ChartMode)}>
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="single">Single Model</TabsTrigger>
                    <TabsTrigger value="comparison">Compare Models</TabsTrigger>
                    <TabsTrigger value="configurations">Configurations</TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="mt-4">
                    <SingleModelChart data={chartData} />
                </TabsContent>

                <TabsContent value="comparison" className="mt-4">
                    <ComparisonChart data={chartData} modelNames={modelNames} />
                </TabsContent>

                <TabsContent value="configurations" className="mt-4">
                <ConfigurationsChart data={chartData} modelNames={modelNames} />
                </TabsContent>

            </Tabs>
        </div>
    );
}
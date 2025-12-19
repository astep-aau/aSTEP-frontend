/**
 * Chart Configuration Constants
 *
 * Centralized configuration for all chart styling, colors, and settings.
 * Supports both light and dark themes via CSS variables.
 */

/**
 * Color scheme for traffic data visualization
 * Following the design specification from CLAUDE.md
 */
export const CHART_COLORS = {
  // Primary data colors
  observed: '#3B82F6',        // Blue - Observed traffic data (truth)
  imputed: '#F97316',         // Orange - Model predictions
  missing: '#9CA3AF',         // Gray - Missing data regions

  // Model comparison colors (for multi-model views)
  model1: '#F97316',          // Orange - Primary model
  model2: '#10B981',          // Green - Secondary model
  model3: '#8B5CF6',          // Purple - Tertiary model

  // Performance indicators
  success: '#10B981',         // Green - Best performance / low error
  warning: '#FBBF24',         // Yellow - Medium performance
  error: '#EF4444',           // Red - Worst performance / high error

  // UI elements
  grid: '#E5E7EB',            // Light gray for grid lines
  text: '#374151',            // Dark gray for text
  background: '#FFFFFF',      // White background
} as const;

/**
 * Dark theme colors (using CSS variables for theme support)
 */
export const CHART_COLORS_DARK = {
  grid: '#374151',
  text: '#D1D5DB',
  background: '#1F2937',
} as const;

/**
 * Chart dimension defaults
 */
export const CHART_DIMENSIONS = {
  defaultHeight: 400,
  defaultWidth: 800,
  minHeight: 300,
  maxHeight: 800,

  // Margins for better spacing
  margin: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 20,
  },

  // Error chart (Mode 4) specific dimensions
  errorChart: {
    mainHeight: 250,
    errorHeight: 150,
    gap: 20,
  },
} as const;

/**
 * Line styling configurations
 */
export const LINE_STYLES = {
  observed: {
    strokeWidth: 2,
    strokeDasharray: undefined, // Solid line
    dot: false,                 // No dots for cleaner look with large datasets
    activeDot: { r: 4 },
  },
  imputed: {
    strokeWidth: 2,
    strokeDasharray: undefined,
    dot: false,
    activeDot: { r: 4 },
  },
  comparison: {
    strokeWidth: 2,
    strokeDasharray: '5 5',     // Dashed for secondary models
    dot: false,
    activeDot: { r: 4 },
  },
} as const;

/**
 * Area styling for missing data regions
 */
export const AREA_STYLES = {
  missing: {
    fillOpacity: 0.2,
    strokeWidth: 0,
  },
} as const;

/**
 * Error thresholds for Mode 4 (Error Visualization)
 * Based on km/h differences between observed and imputed
 */
export const ERROR_THRESHOLDS = {
  low: 2,      // < 2 km/h = Green (excellent)
  medium: 5,   // 2-5 km/h = Yellow (acceptable)
  high: Infinity, // > 5 km/h = Red (needs improvement)
} as const;

/**
 * Brush component configuration
 * Used for zooming/panning through large time series
 */
export const BRUSH_CONFIG = {
  height: 30,
  fill: CHART_COLORS.grid,
  stroke: CHART_COLORS.observed,
  travellerWidth: 10,
  dataKey: 'timestamp',
  startIndex: 0,
  endIndex: 100, // Show first ~100 points by default
} as const;

/**
 * Tooltip styling
 */
export const TOOLTIP_STYLES = {
  contentStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  labelStyle: {
    fontWeight: 600,
    marginBottom: '8px',
    color: CHART_COLORS.text,
  },
  itemStyle: {
    padding: '4px 0',
  },
} as const;

/**
 * Animation configuration
 */
export const ANIMATION_CONFIG = {
  animationDuration: 800,
  animationEasing: 'ease-in-out' as const,
  isAnimationActive: true,
} as const;

/**
 * Responsive breakpoints for chart sizing
 */
export const RESPONSIVE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Get color based on error magnitude
 * Used in Mode 4 for color-coded error bars
 */
export function getErrorColor(error: number): string {
  const absError = Math.abs(error);

  if (absError < ERROR_THRESHOLDS.low) {
    return CHART_COLORS.success;
  } else if (absError < ERROR_THRESHOLDS.medium) {
    return CHART_COLORS.warning;
  } else {
    return CHART_COLORS.error;
  }
}

/**
 * Get model color by index
 * For multi-model comparison views
 */
export function getModelColor(index: number): string {
  const colors = [
    CHART_COLORS.model1,
    CHART_COLORS.model2,
    CHART_COLORS.model3,
  ];
  return colors[index % colors.length];
}

/**
 * Calculate opacity based on performance rank
 * For Mode 3 (Multiple Configurations)
 * Best model = 100% opacity, worst = 30% opacity
 */
export function getOpacityByRank(rank: number, totalModels: number): number {
  if (totalModels === 1) return 1;

  // Linear interpolation from 1.0 (best) to 0.3 (worst)
  const minOpacity = 0.3;
  const maxOpacity = 1.0;

  return maxOpacity - ((rank - 1) / (totalModels - 1)) * (maxOpacity - minOpacity);
}

/**
 * Format speed value for display
 */
export function formatSpeed(speed: number | null | undefined): string {
  if (speed === null || speed === undefined) {
    return 'N/A';
  }
  return `${speed.toFixed(1)} km/h`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  return date.toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format error value for display
 */
export function formatError(error: number): string {
  return `${error >= 0 ? '+' : ''}${error.toFixed(2)} km/h`;
}

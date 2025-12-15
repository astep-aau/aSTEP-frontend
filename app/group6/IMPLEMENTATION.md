# Group 6 Attributes Prediction - Implementation Guide

> Step-by-step guide to implementing the traffic data imputation visualization system

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20.19.6 (already installed)
- npm 10.8.2 (already installed)
- Next.js 15.5.3 project (aSTEP-frontend)

### Development Environment Setup

**1. Navigate to Project Directory**
```bash
cd "/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend"
```

**2. Install Core Dependencies**
```bash
# Chart library and date utilities
npm install recharts date-fns

# Testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**3. Add shadcn/ui Components**
```bash
npx shadcn@latest add select checkbox slider accordion alert table
```

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Type Definitions & Mock Data) ⭐ START HERE

**File 1: Type Definitions**
- **Path**: `app/group6/services/imputation-api.ts`
- **Purpose**: TypeScript interfaces for all API responses
- **What to create**:
  ```typescript
  // Add these interfaces:
  - ModelType (model architecture info)
  - ModelMetrics (performance metrics with hyperparameters)
  - RoadSegment (edge information)
  - TimeRange (available time window)
  - ImputationResult (time series data)
  - HyperparamFilters (filter state)
  ```
- **Reference**: `/app/cs-25-sw-5-11/services/route-api.ts`

**File 2: Mock Data Generator**
- **Path**: `app/group6/services/mock-data.ts`
- **Purpose**: Generate realistic test data for development
- **What to create**:
  ```typescript
  // Add these functions:
  - getMockRoadSegments() → 5 Harbin road segments
  - getMockTimeRange() → Jan 15-22, 2024 (1 week)
  - generateMockImputationResult(modelId, edgeId, start, end) → Realistic time series
  ```
- **Data Characteristics**:
  - 15-minute resolution (672 points/week)
  - Base speeds 20-60 km/h (vary by time of day)
  - 20% missing data rate
  - Model-specific error patterns (GAT slightly better than GraphSAGE)

**File 3: API Service Functions**
- **Path**: `app/group6/services/imputation-api.ts` (add below interfaces)
- **What to create**:
  ```typescript
  // Add these fetch functions:
  - fetchModelTypes() → GET /api/imputation/model-types
  - fetchModelMetrics(modelTypeId) → GET /api/imputation/model-metrics/[model_type]
  - fetchRoadSegments() → GET /api/imputation/edges
  - fetchTimeRange() → GET /api/imputation/time-intervals
  - fetchImputationResult(modelId, edgeId, start, end) → GET impute-result
  ```
- **Error Handling**: Try-catch with descriptive errors
- **Pattern**: Follow Group 11's fetch wrapper approach

**✅ Phase 1 Completion Checklist**
- [x] Type interfaces defined ✅ 2025-12-15
- [x] Mock data generators created ✅ 2025-12-15
- [x] API service functions implemented ✅ 2025-12-15
- [x] No TypeScript errors ✅ 2025-12-15

---

### Phase 2: API Routes (Backend Integration)

**Working Endpoints** (proxy to backend):

**File 4: Model Types Route**
- **Path**: `app/api/imputation/model-types/route.ts`
- **Pattern**: Copy from `/app/api/journey/route.ts`
- **Changes**:
  - Read `process.env.GROUP6_URL`
  - Fetch from `${baseUrl}/model-types/`
  - Return JSON with error handling

**File 5: Model Metrics Route**
- **Path**: `app/api/imputation/model-metrics/[model_type]/route.ts`
- **Pattern**: Same as above
- **Changes**:
  - Dynamic route parameter: `[model_type]`
  - Fetch from `${baseUrl}/model-metrics/${model_type}`

**Mock Endpoints** (return mock data):

**File 6: Edges Route**
- **Path**: `app/api/imputation/edges/route.ts`
- **Content**: `GET` handler returning `getMockRoadSegments()`
- **Note**: Add TODO comment for backend replacement

**File 7: Time Intervals Route**
- **Path**: `app/api/imputation/time-intervals/route.ts`
- **Content**: `GET` handler returning `getMockTimeRange()`

**File 8: Imputation Result Route**
- **Path**: `app/api/imputation/impute-result/[...params]/route.ts`
- **Content**: Parse params, call `generateMockImputationResult()`
- **Params**: `[model_id, edge_id, start_time, end_time]`

**✅ Phase 2 Completion Checklist**
- [ ] Working endpoints proxy to backend
- [ ] Mock endpoints return mock data
- [ ] All routes handle errors correctly
- [ ] Test with curl or browser

---

### Phase 3: Simple Components (UI Building Blocks)

**File 9: Road Segment Selector**
- **Path**: `app/group6/components/RoadSegmentSelector.tsx`
- **Props**: `{ segments, selected, onSelect, loading }`
- **UI**: Searchable Select component (shadcn)
- **Display**: `{edge_id} - {name} ({road_type})`
- **States**: Loading skeleton

**File 10: Time Range Selector**
- **Path**: `app/group6/components/TimeRangeSelector.tsx`
- **Props**: `{ availableRange, selected, onSelect }`
- **UI**:
  - Preset buttons (Last 24h, Last Week, Full Dataset)
  - Manual datetime-local inputs
  - Validation against available range
- **Library**: date-fns for date manipulation

**File 11: Export Controls**
- **Path**: `app/group6/components/ExportControls.tsx`
- **Props**: `{ selectedModels, onDownload }`
- **UI**: Download buttons for each selected model
- **Features**: Disabled state when no models selected

**File 12: Component Index**
- **Path**: `app/group6/components/index.tsx`
- **Content**: Export all components for clean imports
```typescript
export { RoadSegmentSelector } from './RoadSegmentSelector'
export { TimeRangeSelector } from './TimeRangeSelector'
export { ExportControls } from './ExportControls'
// ... add more as you create them
```

**✅ Phase 3 Completion Checklist**
- [ ] All 3 simple components created
- [ ] Components render without errors
- [ ] Props are properly typed
- [ ] Basic styling with Tailwind applied

---

### Phase 4: Complex Components (Interactive Features)

**File 13: Model Selector**
- **Path**: `app/group6/components/ModelSelector.tsx`
- **Props**: `{ models, selected, onSelect, maxSelect }`
- **UI**: Grid of cards (checkbox + metrics)
- **Display**:
  - Model type, MAE, RMSE, training time
  - Key hyperparameters (LR, hidden_dim, sequence_length)
  - Badge color: Green (best MAE), Yellow (middle), Red (worst)
  - Max selection warning (3 models max)
- **Logic**: Multi-select with max 3 limit

**File 14: Configuration Filters**
- **Path**: `app/group6/components/ConfigurationFilters.tsx`
- **Props**: `{ filters, onFilterChange, onReset }`
- **UI**: Collapsible Accordion with:
  - Learning rate: Range slider (0.0001 - 0.01)
  - Hidden dim: Multi-select checkboxes (32, 64, 128, 256)
  - Sequence length: Multi-select (12, 24, 48)
  - Batch size: Multi-select (16, 32, 64)
  - Reset button

**File 15: Metrics Display**
- **Path**: `app/group6/components/MetricsDisplay.tsx`
- **Props**: `{ models, selectedIds }`
- **UI**: Comparison Table (shadcn Table component)
- **Columns**: Model, MAE, RMSE, R², Training Time
- **Features**:
  - Color-coded best/worst values
  - Expandable hyperparameters section

**✅ Phase 4 Completion Checklist**
- [ ] All 3 complex components created
- [ ] Multi-select logic works correctly
- [ ] Filters apply correctly
- [ ] Metrics table displays data
- [ ] Responsive design implemented

---

### Phase 5: Chart Visualization (Core Feature)

**File 16: Chart Utilities**
- **Path**: `app/group6/lib/chart-utils.ts` (create `lib/` folder)
- **Functions**:
  ```typescript
  - transformDataForMode(data, mode) → Recharts format
  - calculateErrorMetrics(observed, imputed) → MAE, RMSE, R²
  - getMissingDataRanges(data) → Gap detection for gray shading
  - getColorByError(error) → green/yellow/red
  ```

**File 17: Chart Configuration**
- **Path**: `app/group6/lib/chart-config.ts`
- **Content**:
  ```typescript
  // Color scheme constants
  COLORS = {
    observed: '#3B82F6',    // Blue
    imputed: '#F97316',     // Orange
    missing: '#9CA3AF',     // Gray
    success: '#10B981',     // Green
    warning: '#FBBF24',     // Yellow
    error: '#EF4444'        // Red
  }
  // Theme-aware colors
  // Responsive breakpoints
  ```

**File 18: Time Series Chart** 🎯 MOST COMPLEX
- **Path**: `app/group6/components/TimeSeriesChart.tsx`
- **Props**: `{ data, mode, onModeChange }`
- **Library**: Recharts
- **Dynamic Import**: `ssr: false` for client-side rendering
- **4 Visualization Modes**:

**Mode 1: Single Model vs Observed**
- Blue solid: Observed values
- Orange solid: Imputed values
- Gray shaded: Missing data regions
- Tooltip: Timestamp, observed, imputed, difference

**Mode 2: Two Models Comparison**
- Blue solid: Observed
- Orange dashed: Model 1 (GAT-BiGRU)
- Green dashed: Model 2 (GraphSAGE-BiGRU)
- Tooltip: All 3 values

**Mode 3: Multiple Configurations**
- Blue solid: Observed
- Multiple orange lines (opacity by MAE rank)
- Best model: 100% opacity
- Worst model: 30% opacity

**Mode 4: Error Visualization**
- Two subplots (ComposedChart):
  - Top: Observed vs Imputed (lines)
  - Bottom: Absolute error (bars, color-coded)
- Shared X-axis with Brush

**Common Features**:
- Mode selector tabs (shadcn Tabs)
- Zoom/pan via Brush component
- Responsive sizing
- Dark mode support
- Custom tooltip

**✅ Phase 5 Completion Checklist**
- [ ] Chart utilities created
- [ ] Chart config created
- [ ] TimeSeriesChart component created
- [ ] Mode 1 (Single) works
- [ ] Mode 2 (Compare) works
- [ ] Mode 3 (Configs) works
- [ ] Mode 4 (Error) works
- [ ] Zoom/pan functional
- [ ] Dark mode tested

---

### Phase 6: Main Orchestrator (Integration)

**File 19: Group6Client Component** 🎯 CENTRAL HUB
- **Path**: `app/group6/components/Group6Client.tsx`
- **Directive**: `'use client'`
- **Props**: `{ backendUrl: string }`

**State Management**:
```typescript
// Data Loading
const [modelTypes, setModelTypes] = useState<ModelType[]>([])
const [availableModels, setAvailableModels] = useState<ModelMetrics[]>([])
const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([])
const [timeRange, setTimeRange] = useState<TimeRange | null>(null)

// User Selections
const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
const [selectedModels, setSelectedModels] = useState<string[]>([])
const [selectedTimeRange, setSelectedTimeRange] = useState<{start, end} | null>(null)
const [visualizationMode, setVisualizationMode] = useState('single')

// Chart Data
const [imputationResults, setImputationResults] = useState<ImputationResult[]>([])

// UI State
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [filters, setFilters] = useState<HyperparamFilters>({})
```

**Data Flow**:
1. On Mount → Fetch model types, road segments, time range → Auto-select
2. On Model Type Selected → Fetch model metrics
3. On Filters Changed → Filter available models
4. On Selections Complete → Fetch imputation results → Transform → Render

**Layout**:
```tsx
<div className="space-y-6 p-6">
  <h1>Traffic Data Imputation</h1>

  {/* Control Panel - 3 columns */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <RoadSegmentSelector />
    <ModelSelector />
    <TimeRangeSelector />
  </div>

  {/* Configuration Filters */}
  <ConfigurationFilters />

  {/* Main Area - Chart + Metrics */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <TimeSeriesChart />
    </div>
    <div>
      <MetricsDisplay />
    </div>
  </div>

  {/* Export Controls */}
  <ExportControls />

  {/* Error Display */}
  {error && <ErrorDisplay />}
</div>
```

**File 20: Update Server Component**
- **Path**: `app/group6/page.tsx` [UPDATE EXISTING]
- **Content**:
```typescript
import { Group6Client } from './components'

export const dynamic = 'force-dynamic'

export default function Group6Page() {
  const backendUrl = process.env.GROUP6_URL || process.env.NEXT_PUBLIC_GROUP6_URL || ''
  return <Group6Client backendUrl={backendUrl} />
}
```

**✅ Phase 6 Completion Checklist**
- [ ] Group6Client created
- [ ] All state management implemented
- [ ] Data flow working end-to-end
- [ ] Layout responsive
- [ ] Error handling working
- [ ] page.tsx updated
- [ ] Application runs without errors

---

### Phase 7: Testing Infrastructure

**File 21: Jest Configuration** (if needed)
- **Path**: `jest.config.js` (project root)
- **Setup**: jsdom environment, module paths, transform

**File 22-24: Component Tests**
- **Path**: `app/group6/__tests__/RoadSegmentSelector.test.tsx`
- **Tests**: Renders options, handles selection, shows loading

- **Path**: `app/group6/__tests__/ModelSelector.test.tsx`
- **Tests**: Multi-select, max limit (3 models), badge colors

- **Path**: `app/group6/__tests__/TimeSeriesChart.test.tsx`
- **Tests**: Mode switching (mock Recharts components)

**File 25: API Service Tests**
- **Path**: `app/group6/__tests__/imputation-api.test.ts`
- **Tests**: Mock fetch, error handling, data parsing

**Run Tests**:
```bash
npm test
```

**✅ Phase 7 Completion Checklist**
- [ ] Jest configured
- [ ] At least 3 component tests created
- [ ] API service tests created
- [ ] All tests passing
- [ ] Coverage >50% (bonus)

---

### Phase 8: Documentation & Polish

**File 26: Update CLAUDE.md**
- **Path**: `app/group6/CLAUDE.md` [UPDATE EXISTING]
- **Changes**:
  - Mark components as ✅ Complete
  - Update "What's Missing" section → "What's Complete"
  - Add Environment Setup section:
    - Local: `.env.local` with `GROUP6_URL=http://localhost:8000`
    - Kubernetes: `GROUP6_URL=http://group6-service.cs-25-sw-5-06.svc.cluster.local:8000`
    - Testing instructions

**Final Polish**:
- [ ] Test dark mode
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test all user workflows
- [ ] Fix any UI/UX issues
- [ ] Verify accessibility (keyboard navigation)
- [ ] Clean up console warnings

---

## 📚 Quick Reference

### Pattern Reference Files

**Read these before implementing:**

1. **Component Structure Pattern**
   - **File**: `/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend/app/cs-25-sw-5-11/components/index.tsx`
   - **What to learn**: Main client component structure, state management, useEffect patterns

2. **API Service Pattern**
   - **File**: `/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend/app/cs-25-sw-5-11/services/route-api.ts`
   - **What to learn**: TypeScript interfaces, fetch functions, error handling

3. **API Route Pattern**
   - **File**: `/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend/app/api/journey/route.ts`
   - **What to learn**: Next.js API route structure, environment variables, proxy pattern

4. **Specification Document**
   - **File**: `/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend/app/group6/CLAUDE.md`
   - **What to learn**: Full requirements, MoSCoW priorities, API specs

### Color Scheme Reference

```typescript
const COLORS = {
  observed: '#3B82F6',    // Blue - Observed traffic data
  imputed: '#F97316',     // Orange - Model predictions
  missing: '#9CA3AF',     // Gray - Missing data regions
  success: '#10B981',     // Green - Best performance / low error
  warning: '#FBBF24',     // Yellow - Medium performance / medium error
  error: '#EF4444'        // Red - Worst performance / high error
}
```

### shadcn/ui Components Already Available

- `button`, `card`, `input`, `label`, `tabs`, `tooltip`, `separator`, `skeleton`

### Need to Add (Phase 1)

- `select`, `checkbox`, `slider`, `accordion`, `alert`, `table`

---

## 🎯 Success Criteria

### Launch Checklist (Minimum Viable Product)

- [ ] All 7 UI components render without errors
- [ ] Working endpoints integrated (model-types, model-metrics)
- [ ] Mock endpoints functional (edges, time-intervals, impute-result)
- [ ] Chart displays observed vs imputed (Mode 1 minimum)
- [ ] Model selection works (max 3 models enforced)
- [ ] Responsive desktop layout working
- [ ] Error handling with user-friendly messages
- [ ] Dark mode support (inherited, test both modes)
- [ ] Basic tests pass (>3 test files with >10 tests total)
- [ ] Documentation updated in CLAUDE.md

### Post-Launch Enhancements (Nice to Have)

- [ ] All 4 chart modes implemented
- [ ] Configuration filters fully functional
- [ ] Metrics comparison table complete
- [ ] Model download functional
- [ ] Chart zoom/pan via Brush
- [ ] Mobile responsive layout
- [ ] Test coverage >50%
- [ ] Loading states polished
- [ ] Accessibility features (keyboard nav, ARIA labels)

---

## 💡 Implementation Tips

### Development Workflow

1. **Always start the dev server**:
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:3000/group6`

2. **Use TypeScript strict mode** - Fix all type errors immediately

3. **Test in the browser** after each component - Don't wait until the end

4. **Use React DevTools** - Install browser extension for debugging

5. **Check console for errors** - Fix warnings as you go

### Common Pitfalls to Avoid

❌ **Don't**: Import Recharts components in server components
✅ **Do**: Use dynamic import with `ssr: false`

❌ **Don't**: Fetch data in components directly
✅ **Do**: Use API service layer functions

❌ **Don't**: Hardcode backend URLs
✅ **Do**: Use `process.env.GROUP6_URL`

❌ **Don't**: Skip error handling
✅ **Do**: Always wrap fetch calls in try-catch

❌ **Don't**: Ignore TypeScript errors
✅ **Do**: Fix types immediately

### Performance Best Practices

- Use `React.memo` for expensive components (TimeSeriesChart)
- Debounce filter changes (300ms delay)
- Use `useMemo` for data transformations
- Lazy load chart component with dynamic import
- Use Recharts Brush for zoom (don't render all 672 points at once)

### Accessibility Reminders

- Add ARIA labels to charts and controls
- Ensure keyboard navigation works (Tab, Enter, Arrow keys)
- Use color + pattern for colorblind users (dashed lines, not just colors)
- Add loading announcements for screen readers

---

## 🆘 Getting Help

### When You're Ready to Implement

Just ask Claude for help with specific files:

- "Help me create the type definitions" (Phase 1, File 1)
- "Help me create the mock data generator" (Phase 1, File 2)
- "Help me create the API service functions" (Phase 1, File 3)
- "Help me create the model-types API route" (Phase 2, File 4)
- "Help me create the RoadSegmentSelector component" (Phase 3, File 9)
- etc.

Claude will provide the exact code for each file following this plan!

### Stuck on Something?

Ask specific questions:
- "How do I structure the ModelSelector component?"
- "What's the best way to handle chart mode switching?"
- "How do I test the TimeSeriesChart with Recharts?"
- "How do I calculate error metrics for the chart?"

### Want to See Examples?

Ask Claude to show you:
- "Show me an example of the ImputationResult interface"
- "Show me how to use dynamic imports for charts"
- "Show me how to create a Next.js API route"

---

## 📦 Project Structure Summary

```
app/group6/
├── page.tsx                                    # [UPDATE] Server component
├── CLAUDE.md                                   # [EXISTS] Full specification
├── IMPLEMENTATION.md                           # [THIS FILE] Implementation guide
├── components/                                 # [CREATE]
│   ├── Group6Client.tsx                        # Main orchestrator (File 19)
│   ├── RoadSegmentSelector.tsx                 # File 9
│   ├── ModelSelector.tsx                       # File 13
│   ├── ConfigurationFilters.tsx                # File 14
│   ├── TimeRangeSelector.tsx                   # File 10
│   ├── TimeSeriesChart.tsx                     # File 18 (most complex)
│   ├── MetricsDisplay.tsx                      # File 15
│   ├── ExportControls.tsx                      # File 11
│   └── index.tsx                               # File 12 (exports)
├── services/                                   # [CREATE]
│   ├── imputation-api.ts                       # Files 1 & 3 (types + API)
│   └── mock-data.ts                            # File 2
├── lib/                                        # [CREATE]
│   ├── chart-utils.ts                          # File 16
│   └── chart-config.ts                         # File 17
└── __tests__/                                  # [CREATE]
    ├── RoadSegmentSelector.test.tsx            # File 22
    ├── ModelSelector.test.tsx                  # File 23
    ├── TimeSeriesChart.test.tsx                # File 24
    └── imputation-api.test.ts                  # File 25

app/api/imputation/                             # [CREATE]
├── model-types/route.ts                        # File 4
├── model-metrics/[model_type]/route.ts         # File 5
├── edges/route.ts                              # File 6 (mock)
├── time-intervals/route.ts                     # File 7 (mock)
└── impute-result/[...params]/route.ts          # File 8 (mock)
```

**Total Files**: 26 files (20 new + 6 updates)

---

## 🎉 Ready to Start?

**Recommended starting point**: Phase 1, File 1 (Type Definitions)

When you're ready, tell Claude:
> "Help me create the type definitions in app/group6/services/imputation-api.ts"

And we'll begin building your traffic data imputation visualization system! 🚗📊

---

**Last Updated**: 2025-12-12
**Plan Reference**: `/home/claude/.claude/plans/fancy-seeking-pudding.md`
**Specification**: `app/group6/CLAUDE.md`

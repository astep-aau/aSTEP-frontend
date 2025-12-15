# Group 6 - Attributes Prediction (Traffic Imputation)

> Traffic data imputation using Graph Neural Networks (GAT-BiGRU and GraphSAGE-BiGRU models) to predict missing speed data on road segments

---

## Quick Reference

| Key | Value |
|-----|-------|
| **Status** | 🟢 Active Development (Infrastructure Complete) |
| **Frontend Location** | `/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend/app/group6/` |
| **Backend Location** | `/workspace/Magnus-PC/800 Projects/aSTEP/Attribute-Prediction/` |
| **Backend URL** | `process.env.GROUP6_URL` (✅ Configured in .env.local) |
| **Tech Stack** | Next.js 15, React 19, TypeScript, Tailwind 4, shadcn/ui |
| **Backend Stack** | FastAPI, PostgreSQL, PyTorch, PyTorch Geometric |
| **Chart Library** | TBD (Recharts or Chart.js) |
| **Last Updated** | 2025-12-15 |

---

## 1. Project Overview

### What Is This?

**Domain**: Traffic data analysis and prediction

**Problem**: Missing traffic speed data on road segments due to sparse GPS probe data

**Solution**: Graph Neural Network models that leverage spatial (road network topology) and temporal (time series) dependencies to accurately impute missing values

**Users**: All users using the aSTEP platform

### Core Functionality

1. **Visualize Imputation Results** - Display time series data for selected road segments with clear indication of observed vs. imputed values
2. **Compare Model Architectures** - Side-by-side comparison of GAT-BiGRU and GraphSAGE-BiGRU models
3. **Compare Hyperparameter Configurations** - Analyze impact of different training parameters (learning rate, hidden dimensions, etc.)
4. **Display Performance Metrics** - Show MAE, RMSE, bias, gap, and training time
5. **Download Trained Models** - Export models in PyTorch (.pth) format

### Data Model

- **Graph Structure**: Road network as graph G = (V, E) where V = road segments (nodes), E = connections
- **Feature Tensor Shape**: (T, N, F_feat)
  - T = timesteps (time series)
  - N = road segments (nodes)
  - F_feat = 6 features (speed, road type, one-way indicator, time of day, day of week, additional)
- **Geographic Coverage**: Harbin, China road network

---

## 2. Requirements (MoSCoW)

### Must Have

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| **M-1** | Visualisation of imputation results | ⭕ Not Started | Core feature - time series chart |
| **M-2** | Visualised comparison between different models | ⭕ Not Started | Multi-model overlay |
| **M-3** | Imputation using GAT-BiGRU and GraphSAGE-BiGRU | ⚠️ Backend Stub | Data pipeline pending |
| **M-4** | Tests verifying functionality | ⭕ Not Started | Jest + React Testing Library |
| **M-5** | Run on aSTEP cluster | 🔧 Infrastructure | Kubernetes deployment |
| **M-6** | Model validation comparing architectures | ⚠️ Backend Pending | Metrics calculation |

### Should Have

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| **S-1** | Downloadable trained models (.pth) | ⚠️ Backend Stub | Currently returns .txt |
| **S-2** | Intuitive and user-friendly interface | ⭕ Not Started | UI/UX implementation |

### Could Have

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| **C-1** | Allow users to upload own data | ⭕ Not Planned | Future enhancement |
| **C-2** | Allow users to download imputed data | ⭕ Not Planned | Future enhancement |

---

## 3. Current Implementation Status

### ✅ Infrastructure Complete

**Frontend Architecture:**
- ✅ **Page Structure** - `app/group6/page.tsx` ready for integration
- ✅ **Root Layout** - Sidebar navigation, theme support (inherited from main app)
- ✅ **API Service Layer** (`services/imputation/`) ✅
  - Typed API client functions with error handling
  - Clean TypeScript interfaces matching backend schemas
- ✅ **Modular Mock Data** (`services/mock-data/`) ✅
  - 6 specialized modules: model-types, metrics, losses, hyperparameters, roads, imputation
  - Realistic traffic patterns with cascading filter support
  - Complete with helper functions and time-based calculations
- ✅ **Next.js API Proxy Routes** (`app/api/imputation/`) ✅
  - 8 proxy routes: model-types, model-metrics, model-loss, roads, time-interval, impute-result, download-model
  - Environment-based routing (USE_MOCKS for development)
  - Proper error handling and response formatting
- ✅ **Component Structure** (`components/`) ✅
  - 10 components with index.ts barrel exports
  - Group6Client, ModelTypeSelector, ModelSelector, TimeIntervalSelector, RoadSegmentSelector, ConfigurationFilters, TimeSeriesChart, MetricsDisplay, ExportControls, SubmitButton
- ✅ **Custom Hooks** (`hooks/`) ✅
  - useApi, useDownloadModel with index.ts exports
- ✅ **Utility Libraries** (`lib/`) ✅
  - chart-utils.ts, chart.config.ts with index.ts exports
- ✅ **Test Infrastructure** (`__tests__/`) ✅
  - 5 test files: ModelDownload.test, ModelSelector.test, RoadSegmentSelector.test, TimeSeriesChart.test, imputation.api.test
- ✅ **shadcn/ui Components** Added:
  - accordion, alert, checkbox, select, slider, table
- ✅ **Environment Configuration** (`.env.local` with GROUP6_URL) ✅

**Backend:**
- FastAPI application structure
- PostgreSQL database with tables: `model_type`, `model_metrics`, `hyperparam`, `loss`
- **Implemented Endpoints:**
  - ✅ `GET /model-types/` - Returns list of model architectures
  - ✅ `GET /model-metrics/{model_type}` - Returns metrics with hyperparameters and loss values

### 🔄 In Progress

- **Component Implementation** - Components created but logic pending
- **Chart Library Integration** - Decision between Recharts or Chart.js pending
- **Test Implementation** - Test files created, test cases pending

### ❌ What's Missing (Frontend)

- **Component Logic** - UI interaction and state management
- **Chart Rendering** - Time series visualization implementation
- **Full Test Coverage** - Test cases need implementation
- **Environment Variable in Production** - `GROUP6_URL` not in KUBE_ENV

### ⚠️ Backend Stubs (Need Implementation)

- `GET /impute-result/{model_id}/{edge_id}/{start_time}/{end_time}` - Currently returns placeholder
- `GET /impute-result/edges` - Not implemented (design spec)
- `GET /impute-result/time-intervals` - Not implemented (design spec)
- `GET /download_model/{model_id}` - Returns `testfile.txt` instead of `.pth`

### 🚫 Known Blockers

1. **Backend Data Pipeline** - No imputation results in database (needs model training + data ingestion)
2. **Environment Config for Production** - `GROUP6_URL` not defined in KUBE_ENV (local .env.local exists)
3. **Chart Library Decision** - Need to choose between Recharts and Chart.js

---

## 3.5 File Organization

### Module Structure

```
app/group6/
├── page.tsx                          # Server component (Next.js page)
│
├── components/                       # UI Components
│   ├── index.ts                      # ✅ Barrel exports (10 components)
│   ├── Group6Client.tsx              # Main client orchestrator
│   ├── ModelTypeSelector.tsx         # Model architecture selector
│   ├── ModelSelector.tsx             # Model configuration selector
│   ├── TimeIntervalSelector.tsx      # Time range selector
│   ├── RoadSegmentSelector.tsx       # Road segment selector
│   ├── ConfigurationFilters.tsx      # Hyperparameter filters
│   ├── TimeSeriesChart.tsx           # Main visualization component
│   ├── MetricsDisplay.tsx            # Performance metrics display
│   ├── ExportControls.tsx            # Model download controls
│   └── SubmitButton.tsx              # Form submission
│
├── hooks/                            # Custom React Hooks
│   ├── index.ts                      # ✅ Barrel exports
│   ├── useApi.ts                     # API data fetching hook
│   └── useDownloadModel.ts           # Model download hook
│
├── lib/                              # Utility Libraries
│   ├── index.ts                      # ✅ Barrel exports
│   ├── chart-utils.ts                # Chart data transformation
│   └── chart.config.ts               # Chart configuration
│
├── services/                         # API Services & Mock Data
│   ├── index.ts                      # ✅ Barrel exports (6 mock modules)
│   ├── mock-data.ts                  # ⚠️ DEPRECATED (kept for reference)
│   │
│   ├── imputation/                   # API Client Layer
│   │   ├── index.ts                  # ✅ Barrel exports
│   │   ├── imputation.api.ts         # Typed fetch functions
│   │   └── imputation.types.ts       # TypeScript interfaces
│   │
│   └── mock-data/                    # Modular Mock Data
│       ├── model-types/index.ts      # ✅ Model architectures (18 lines)
│       ├── metrics/index.ts          # ✅ Model metrics + helpers (102 lines)
│       ├── losses/index.ts           # ✅ Loss aggregation (14 lines)
│       ├── hyperparameters/index.ts  # ✅ Hyperparameter aggregation (14 lines)
│       ├── roads/index.ts            # ✅ Time intervals + roads (230 lines)
│       ├── imputation/index.ts       # ✅ Result generation (110 lines)
│       └── models/                   # ⭕ Unused (has README)
│
├── __tests__/                        # Test Files
│   ├── ModelDownload.test.tsx
│   ├── ModelSelector.test.tsx
│   ├── RoadSegmentSelector.test.tsx
│   ├── TimeSeriesChart.test.tsx
│   └── imputation.api.test.ts
│
├── CLAUDE.md                         # This file
└── IMPLEMENTATION.md                 # Implementation guide
```

### Import Patterns

All modules use **barrel exports** via `index.ts` for clean imports:

```typescript
// Components
import { Group6Client, ModelSelector, TimeSeriesChart } from '@/app/group6/components';

// Hooks
import { useApi, useDownloadModel } from '@/app/group6/hooks';

// Utilities
import { formatSpeed, defaultConfig } from '@/app/group6/lib';

// Mock Data (all functions via single import)
import {
  getMockModelType,
  getMockModelMetrics,
  getMockModelLosses,
  getMockHyperparameters,
  getMockTimeInterval,
  getMockRoads,
  getMockImputationResults
} from '@/app/group6/services';
```

### API Proxy Routes

```
app/api/imputation/
├── model-types/route.ts              # GET /api/imputation/model-types
├── model-metric/[...params]/route.ts # GET /api/imputation/model-metric/{modelType}
├── model-loss/route.ts               # GET /api/imputation/model-loss
├── roads/route.ts                    # GET /api/imputation/roads
├── time-interval/route.ts            # GET /api/imputation/time-interval
├── impute-result/[...params]/route.ts # GET /api/imputation/impute-result/{modelId}/{roadId}/{startTime}/{endTime}
├── download-model/[modelId]/route.ts # GET /api/imputation/download-model/{modelId}
└── imputation/[...]/route.ts         # Legacy route
```

All routes support `USE_MOCKS=true` environment variable for development mode.

---

## 4. API Integration Guide

### Backend Base URL

```typescript
// Access via environment variable
const backendUrl = process.env.GROUP6_URL || "";

// To be added to KUBE_ENV:
// GROUP6_URL=http://group6-service.cs-25-sw-5-06.svc.cluster.local:8000
```

### ✅ Implemented Endpoints

#### `GET /model-types/`

**Purpose**: List available model architectures

**Response**:
```typescript
interface ModelType {
  id: string; // UUID
  name: string; // "GAT-BiGRU" | "GraphSAGE-BiGRU"
}

// Example:
[
  { "id": "uuid-1", "name": "GAT-BiGRU" },
  { "id": "uuid-2", "name": "GraphSAGE-BiGRU" }
]
```

#### `GET /model-metrics/{model_type}`

**Purpose**: Get all trained model variants with performance metrics

**Parameters**:
- `model_type` (path) - UUID of model type

**Response**:
```typescript
interface ModelMetrics {
  id: string; // UUID
  model_type: string; // UUID
  train_time_min: number;
  bias: number | null;
  gap: number | null;
  hyperparameters: Hyperparam[];
  loss: ModelLoss[];
}

interface Hyperparam {
  model_id: string; // UUID
  param_name: string; // "learning_rate", "hidden_dim", etc.
  param_value: string;
}

interface ModelLoss {
  model_id: string; // UUID
  type: string; // "MAE", "RMSE", "train_loss", etc.
  loss_value: number;
  loss_unit: string;
}

// Example:
[
  {
    "id": "model-uuid-1",
    "model_type": "uuid-1",
    "train_time_min": 45,
    "bias": 0.12,
    "gap": 0.05,
    "hyperparameters": [
      { "model_id": "model-uuid-1", "param_name": "learning_rate", "param_value": "0.001" },
      { "model_id": "model-uuid-1", "param_name": "hidden_dim", "param_value": "64" }
    ],
    "loss": [
      { "model_id": "model-uuid-1", "type": "MAE", "loss_value": 2.34, "loss_unit": "km/h" },
      { "model_id": "model-uuid-1", "type": "RMSE", "loss_value": 3.12, "loss_unit": "km/h" }
    ]
  }
]
```

### ⚠️ Stub Endpoints (Design Spec)

These endpoints are specified in the design document but not yet implemented:

#### `GET /impute-result/{model_id}/{edge_id}/{start_time}/{end_time}`

**Purpose**: Get time series imputation data for a specific road segment and time range

**Expected Response**:
```typescript
interface ImputationResult {
  model_id: string;
  edge_id: string;
  timestamps: string[]; // ISO 8601 format
  observed_values: (number | null)[]; // null = missing data
  imputed_values: number[];
  metadata: {
    feature_names: string[];
    missing_rate: number;
  };
}
```

#### `GET /impute-result/edges`

**Purpose**: List all available road segments

**Expected Response**:
```typescript
interface Edge {
  edge_id: string;
  name?: string;
  start_node: string;
  end_node: string;
  road_type: string;
}
```

#### `GET /impute-result/time-intervals`

**Purpose**: Get valid time range for queries

**Expected Response**:
```typescript
interface TimeRange {
  start_time: string; // ISO 8601
  end_time: string;
  resolution: string; // "5min", "15min", etc.
}
```

#### `GET /download_model/{model_id}`

**Purpose**: Download trained PyTorch model

**Expected Response**: Binary `.pth` file

**Current Behavior**: Returns `testfile.txt`

### API Proxy Pattern

Create Next.js API routes to proxy backend calls (for CORS, error handling, auth):

```typescript
// app/api/imputation/model-types/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.GROUP6_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/model-types/`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**Reference**: Follow pattern from `/app/api/journey/route.ts` (Group 11)

---

## 5. Component Specifications

### Component Overview

```
app/group6/
├── components/
│   ├── Group6Client.tsx              # Main orchestrator (state management)
│   ├── RoadSegmentSelector.tsx       # (1) Road segment dropdown
│   ├── ModelSelector.tsx             # (2) Model multi-select with metadata
│   ├── ConfigurationFilters.tsx      # (3) Hyperparameter filter panel
│   ├── TimeRangeSelector.tsx         # (4) Date/time range picker
│   ├── TimeSeriesChart.tsx           # (5) Main visualization (4 modes)
│   ├── MetricsDisplay.tsx            # (6) Performance metrics card
│   ├── ExportControls.tsx            # (7) Model download button
│   └── index.tsx                     # Re-export all components
```

### (1) RoadSegmentSelector

**Type**: Dropdown/Combobox

**Purpose**: Select road segment (edge) for visualization

**Data Source**: `GET /impute-result/edges` (when implemented)

**UI Library**: shadcn/ui combobox (may need to add via `npx shadcn@latest add combobox`)

**Features**:
- Searchable dropdown
- Display edge ID + optional name
- Show road type as secondary info
- Auto-select first edge on load (optional)

### (2) ModelSelector

**Type**: Multi-select checkbox group

**Purpose**: Select one or more models for comparison (max 3)

**Data Source**: `GET /model-metrics/{model_type}`

**UI Library**: shadcn/ui checkbox + custom layout

**Display Per Model**:
- Model type (GAT-BiGRU / GraphSAGE-BiGRU)
- Key hyperparameters (learning_rate, hidden_dim, etc.)
- MAE, RMSE (from loss array)
- Training time

**Validation**: Limit to max 3 models selected (for visualization clarity)

### (3) ConfigurationFilters

**Type**: Filter panel with sliders/dropdowns

**Purpose**: Filter models by hyperparameter ranges

**UI Library**: shadcn/ui slider, select

**Filters**:
- Learning rate range
- Hidden dimension values
- Batch size
- Sequence length
- Dynamic based on available hyperparameters

**Behavior**: Filters `availableModels` array in real-time

### (4) TimeRangeSelector

**Type**: Date/time range picker

**Purpose**: Select time window for visualization

**Data Source**: `GET /impute-result/time-intervals` (for valid range)

**UI Library**: Options:
- shadcn/ui calendar (if available)
- `react-day-picker` with `date-fns`
- Native HTML date input (simpler)

**Features**:
- Calendar view with time selection
- Validation against available data range
- Preset options: "Last 24h", "Last Week", "Full Dataset"

### (5) TimeSeriesChart ⭐ (Most Complex)

**Type**: Interactive line chart with 4 visualization modes

**Chart Library Options**:

**Option A - Recharts** (Recommended):
```bash
npm install recharts
npm install --save-dev @types/recharts
```
- Pros: React-native, TypeScript support, declarative API, good documentation
- Cons: Less customization than D3

**Option B - Chart.js**:
```bash
npm install chart.js react-chartjs-2
```
- Pros: Powerful, established, flexible for complex interactions
- Cons: More imperative API, heavier bundle size

**Visualization Modes**:

**Mode 1: Single Model vs Observed**
- Blue line (solid): Observed values
- Orange line (solid): Imputed values
- Gray shaded regions: Missing data
- Legend with clear labels
- Assessment of model accuracy

**Mode 2: Two Models vs Observed**
- Blue line (solid): Observed
- Orange dashed: Model 1 imputed
- Green dashed: Model 2 imputed
- Hover tooltips: Show exact values + model metadata
- Direct architecture comparison

**Mode 3: Multiple Parameter Configurations**
- Blue line (solid): Observed
- Multiple orange lines (varying opacity): Different configs
- Best model (lowest MAE) at full opacity
- Others at reduced opacity based on relative MAE
- Assess hyperparameter impact

**Mode 4: Error Visualization**
- Main plot: Observed vs imputed (Mode 1 or 2)
- Separate subplot below: Absolute error over time
- Bar chart or line: Error magnitude
- Color-coded by error threshold (green < 2 km/h, yellow 2-5, red > 5)
- Zero baseline with positive/negative deviations

**Chart Features**:
- Zoom and pan (Recharts: `<Brush />` component)
- Crosshair cursor
- Responsive sizing
- Export as PNG (Recharts: `recharts-to-png`)
- Hover tooltips with exact values

### (6) MetricsDisplay

**Type**: Overlay panel/card

**Purpose**: Show numerical performance metrics

**UI Library**: shadcn/ui card, tabs

**Layout**: Side panel or bottom panel (toggle)

**Content**:
- Comparison table (if multiple models selected)
- Metrics: MAE, RMSE, Bias, Gap
- Training time
- Model hyperparameters
- Color-coded best/worst performers (green/yellow/red)

### (7) ExportControls

**Type**: Button group

**Purpose**: Download trained models

**UI Library**: shadcn/ui button

**API**: `GET /download_model/{model_id}`

**Implementation**:
```typescript
const downloadModel = async (modelId: string) => {
  const response = await fetch(`/api/imputation/download/${modelId}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `model_${modelId}.pth`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

## 6. Architecture & Development Patterns

### File Organization

```
app/group6/
├── page.tsx                          # Server component (env var injection)
├── components/
│   ├── Group6Client.tsx              # Main client orchestrator ('use client') 🔄
│   ├── RoadSegmentSelector.tsx       # 🔄 Placeholder
│   ├── ModelSelector.tsx             # 🔄 Placeholder
│   ├── ConfigurationFilters.tsx      # 🔄 Placeholder
│   ├── TimeRangeSelector.tsx         # 🔄 Placeholder
│   ├── TimeSeriesChart.tsx           # 🔄 Placeholder
│   ├── MetricsDisplay.tsx            # 🔄 Placeholder
│   ├── ExportControls.tsx            # 🔄 Placeholder
│   └── index.tsx                     # ❌ Not created
├── services/
│   ├── imputation/                   # ✅ Created
│   │   ├── imputation.api.ts         # ✅ Complete (has bugs)
│   │   └── imputation.types.ts       # ✅ Complete (has type mismatch)
│   └── mockData.ts                   # ✅ Complete (has bug)
└── lib/
    ├── chart-utils.ts                # ✅ Created
    └── chart.config.ts               # ✅ Created

Legend:
✅ Complete implementation
🔄 Placeholder/partial implementation
❌ Not created
```

### Server/Client Pattern

**Reference**: `/app/cs-25-sw-5-03/page.tsx` (Group 3)

**Server Component** (`page.tsx`):
```typescript
export const dynamic = 'force-dynamic';

export default function Page() {
  const url = process.env.GROUP6_URL || process.env.NEXT_PUBLIC_GROUP6_URL || "";
  return <Group6Client backendUrl={url} />;
}
```

**Client Component** (`components/Group6Client.tsx`):
```typescript
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ModelType, ModelMetrics } from '../types/imputation.types'

// Dynamic import for chart library (disable SSR)
const TimeSeriesChart = dynamic(() => import('./TimeSeriesChart'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
})

interface Props {
  backendUrl: string;
}

export default function Group6Client({ backendUrl }: Props) {
  // State management
  const [modelTypes, setModelTypes] = useState<ModelType[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API calls via useEffect
  useEffect(() => {
    // Fetch model types on mount
  }, []);

  // Render UI
  return (
    <div className="container mx-auto p-4">
      {/* Component layout */}
    </div>
  );
}
```

### API Service Pattern

**File**: `app/group6/services/imputation-api.ts`

**Reference**: `/app/cs-25-sw-5-11/services/route-api.ts` (Group 11)

```typescript
export interface ModelType {
  id: string;
  name: string;
}

export async function fetchModelTypes(): Promise<ModelType[]> {
  const response = await fetch('/api/imputation/model-types');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchModelMetrics(modelTypeId: string): Promise<ModelMetrics[]> {
  const response = await fetch(`/api/imputation/model-metrics/${modelTypeId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Additional API functions...
```

### Next.js API Proxy Routes

**Location**: `app/api/imputation/`

**Reference**: `/app/api/journey/route.ts` (Group 11)

Create proxy routes for:
- `app/api/imputation/model-types/route.ts`
- `app/api/imputation/model-metrics/[model_type]/route.ts`
- `app/api/imputation/download/[model_id]/route.ts`
- (Future) `app/api/imputation/edges/route.ts`
- (Future) `app/api/imputation/time-intervals/route.ts`
- (Future) `app/api/imputation/results/[...params]/route.ts`

### Styling Approach

- **Framework**: Tailwind CSS 4 utility-first classes
- **Components**: shadcn/ui components from `/components/ui/`
- **Dark Mode**: Uses `next-themes` (already configured globally)
- **Responsive**: Mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- **Color Scheme**:
  - Blue (`blue-500`): Observed data
  - Orange (`orange-500`): Imputed data
  - Gray (`gray-400`): Missing data regions
  - Green (`green-500`): Best model / low error
  - Red (`red-500`): High error

---

## 7. Critical File Paths

### Reference Patterns (Read These First)

| Pattern | File Path | Purpose |
|---------|-----------|---------|
| **Server/Client Split** | `/app/cs-25-sw-5-03/page.tsx` | Server component with env var injection |
| **Client Orchestrator** | `/app/cs-25-sw-5-03/Group3Client.tsx` | Main client component with state management |
| **API Service** | `/app/cs-25-sw-5-11/services/route-api.ts` | Typed API client functions |
| **API Proxy** | `/app/api/journey/route.ts` | Next.js API route proxying backend |
| **Component Index** | `/app/cs-25-sw-5-11/components/index.tsx` | Component re-exports |

### Environment Configuration

**File**: `/workspace/Magnus-PC/800 Projects/aSTEP/aSTEP-frontend/KUBE_ENV`

**Add**:
```bash
GROUP6_URL=http://group6-service.cs-25-sw-5-06.svc.cluster.local:8000
```

**For Local Development** (docker-compose.yml or .env.local):
```bash
GROUP6_URL=http://localhost:8000
```

### Backend Reference

| Purpose | File Path |
|---------|-----------|
| **Main App** | `/workspace/Magnus-PC/800 Projects/aSTEP/Attribute-Prediction/src/app/main.py` |
| **Model Types Route** | `/workspace/Magnus-PC/800 Projects/aSTEP/Attribute-Prediction/src/app/routes/model_type_routes.py` |
| **Metrics Route** | `/workspace/Magnus-PC/800 Projects/aSTEP/Attribute-Prediction/src/app/routes/metric_routes.py` |
| **Imputation Route** | `/workspace/Magnus-PC/800 Projects/aSTEP/Attribute-Prediction/src/app/routes/impute_results_routes.py` |
| **Download Route** | `/workspace/Magnus-PC/800 Projects/aSTEP/Attribute-Prediction/src/app/routes/download_model_routes.py` |

### Design Specifications

| Document | File Path |
|----------|-----------|
| **Requirements** | `/workspace/Magnus-PC/200 Aalborg Universitet/Semesters/5. Semester/Project/Project/68ccf89ad29e02e87e2da5ff/3-design/Requirements.tex` |
| **Frontend Design** | `/workspace/Magnus-PC/200 Aalborg Universitet/Semesters/5. Semester/Project/Project/68ccf89ad29e02e87e2da5ff/3-design/Frontend.tex` |
| **Backend API** | `/workspace/Magnus-PC/200 Aalborg Universitet/Semesters/5. Semester/Project/Project/68ccf89ad29e02e87e2da5ff/3-design/Backend.tex` |
| **Data Structure** | `/workspace/Magnus-PC/200 Aalborg Universitet/Semesters/5. Semester/Project/Project/68ccf89ad29e02e87e2da5ff/3-design/Data.tex` |
| **Model Architecture** | `/workspace/Magnus-PC/200 Aalborg Universitet/Semesters/5. Semester/Project/Project/68ccf89ad29e02e87e2da5ff/3-design/Model_architecture.tex` |

---

## 8. Changelog

### Format
```markdown
## [YYYY-MM-DD] - [Author/Tool]
### Added
- New features or components
### Changed
- Modifications to existing implementation
### Fixed
- Bug fixes or corrections
### Removed
- Deprecated features
```

---

### [2025-12-15] - Infrastructure Organization

#### Added
- **Modular Mock Data Structure** (`services/mock-data/`)
  - Split monolithic 465-line `mock-data.ts` into 6 focused modules (18-230 lines each)
  - `model-types/` - Model architecture types and constants
  - `metrics/` - Model metrics with helper functions (createHyperparameter, createModelLoss)
  - `losses/` - Aggregated loss data from all models
  - `hyperparameters/` - Aggregated hyperparameter data from all models
  - `roads/` - Time intervals, road segments, cascading filter logic
  - `imputation/` - Realistic imputation result generation with time-based calculations
- **Barrel Export Pattern** - Added `index.ts` to all public modules
  - `components/index.ts` - All 10 UI components
  - `hooks/index.ts` - useApi, useDownloadModel
  - `lib/index.ts` - chart-utils, chart.config
  - `services/index.ts` - All 6 mock data functions
  - Each mock-data subdirectory has its own index.ts
- **Next.js API Proxy Routes** (`app/api/imputation/`)
  - 8 route handlers with USE_MOCKS environment variable support
  - model-types, model-metric, model-loss, roads, time-interval, impute-result, download-model
  - Dynamic imports for mock data functions
  - Proper error handling and status codes
- **shadcn/ui Components**
  - Added: accordion, alert, checkbox, select, slider, table

#### Changed
- Project status: **Foundation Built → Infrastructure Complete**
- Mock data organization: **Monolithic file → Modular directory structure**
- Import pattern: **Direct file imports → Clean barrel exports**
- API route imports: Updated imputation route to use dynamic import from services

#### Fixed
- Mock data structure issues resolved through modular reorganization
- All functions now properly exported via barrel pattern
- Removed unnecessary `__tests__/index.ts` (tests don't need re-exporting)

#### Removed
- `mock-data/models/` directory export (unused module)
- Empty placeholder files (mockLosses.ts, mockMetrics.ts, mockRoads.ts)

#### Notes
- Original `mock-data.ts` marked as deprecated but kept for reference
- All imports now use clean directory-based pattern
- Module organization follows Single Responsibility Principle
- Each module owns its constants and helper functions

---

### [2025-12-13] - User Implementation (Foundation Phase)

#### Added
- **Complete API Service Layer** (`services/imputation/imputation.api.ts`)
  - 6 typed fetch functions for all backend endpoints
  - Error handling with HTTP status checks
- **Complete TypeScript Interfaces** (`services/imputation/imputation.types.ts`)
  - 5 interfaces matching backend Pydantic schemas: ModelType, ModelMetrics, ModelLoss, ImputationResult, Hyperparameter
- **Mock Data Generators** (`services/mockData.ts`)
  - 6 mock functions for frontend-first development: MockImputationResults, MockModelTypes, MockModelMetrics, MockHyperparameters, MockModelLosses, MockExportedModel
- **Library Utilities**
  - `lib/chart-utils.ts` - Data transformation utilities for charts
  - `lib/chart.config.ts` - Chart configuration and styling
- **Component Placeholder Files** (8 files)
  - Group6Client.tsx, ModelSelector.tsx, RoadSegmentSelector.tsx, ConfigurationFilters.tsx, TimeRangeSelector.tsx, TimeSeriesChart.tsx, MetricsDisplay.tsx, ExportControls.tsx
  - All files created with basic structure, no logic implemented
- **Environment Configuration**
  - Created `.env.local` with `GROUP6_URL=http://localhost:8000`
  - Updated `.gitignore` to exclude `.env.local` from version control

#### Changed
- Project phase: **Placeholder → Foundation Built**
- GROUP6_URL status: **Not configured → Configured (.env.local)**

#### Known Issues (See Section 3.5)
- MockModelMetrics() missing return statement (Critical)
- Template literal syntax errors in API calls (Critical)
- API URL paths incorrect (Medium)
- Type mismatch: loss_values vs loss_value (Medium)
- fetchImputationResults() missing parameters (Medium)

#### Notes
- Frontend can now be developed independently using mock data
- Real backend integration blocked by 5 code issues + missing Next.js API proxy routes
- Component logic implementation is next phase
- Chart library (Recharts vs Chart.js) decision still pending

---

### [2025-12-11] - Claude Code (Initial Setup)

#### Added
- Created CLAUDE.md with compressed, frontend-focused context for Group 6 Attributes Prediction
- Documented 7 UI components to implement (RoadSegmentSelector, ModelSelector, ConfigurationFilters, TimeRangeSelector, TimeSeriesChart, MetricsDisplay, ExportControls)
- Listed available API endpoints (model-types, model-metrics) and stub endpoints
- Included both Recharts and Chart.js as chart library options for later decision
- Established server/client pattern following Groups 3 & 11
- Quick reference table with status and tech stack
- MoSCoW requirements table with implementation status
- API integration guide with TypeScript interfaces
- Component specifications with 4 visualization modes for TimeSeriesChart
- Architecture and development patterns section
- Critical file paths for frontend, backend, design specs, and reference patterns
- Structured changelog section

#### Notes
- Chart library decision deferred to implementation phase
- Backend data pipeline incomplete (blocker for full testing)
- GROUP6_URL not yet configured in KUBE_ENV
- Test infrastructure (M-4 requirement) to be added later

---

## Quick Start for Implementation

### For Developers New to This Project

1. **Read this CLAUDE.md** (you're doing it!) - 15-20 min
2. **Explore reference implementations**:
   - Group 3: `/app/cs-25-sw-5-03/`
   - Group 11: `/app/cs-25-sw-5-11/`
3. **Set up environment**:
   ```bash
   cd /workspace/Magnus-PC/800\ Projects/aSTEP/aSTEP-frontend
   npm install
   npm run dev
   ```
4. **Check backend availability**:
   ```bash
   curl http://localhost:8000/model-types/
   ```
5. **Start building**: Begin with API service layer, then simple components (ModelSelector, RoadSegmentSelector)

### For Claude Code

When asked to implement Group 6 features:
1. Read sections 1-3 (Overview, Requirements, Status)
2. Reference section 4 (API Integration) for backend calls
3. Use section 5 (Component Specs) for implementation details
4. Follow section 6 (Architecture) for code patterns
5. Check section 7 (File Paths) for navigation
6. Update section 8 (Changelog) after making changes

---

## Additional Notes

### Dependencies to Add

**Chart Library** (choose during implementation):
```bash
# Option A: Recharts
npm install recharts
npm install --save-dev @types/recharts

# Option B: Chart.js
npm install chart.js react-chartjs-2
```

**Date Utilities**:
```bash
npm install date-fns
```

**shadcn/ui Components to Add**:
```bash
npx shadcn@latest add combobox  # For RoadSegmentSelector
npx shadcn@latest add checkbox  # For ModelSelector
npx shadcn@latest add slider    # For ConfigurationFilters
npx shadcn@latest add calendar  # For TimeRangeSelector (optional)
```

### Security & Boundaries

- All work confined to `/workspace/Magnus-PC/800 Projects/aSTEP/` (within Obsidian vault)
- Backend authentication not yet implemented (all endpoints currently public)
- Frontend should handle backend errors gracefully (stub endpoints may return placeholder data)

---

**End of CLAUDE.md** | Last updated: 2025-12-11

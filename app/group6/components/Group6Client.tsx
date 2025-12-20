'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ModelSelector from './ModelSelector';
import RoadSegmentSelector from './RoadSegmentSelector';
import TimeIntervalSelector from './TimeIntervalSelector';
import {
	fetchModelTypes,
	fetchModelMetrics,
	fetchRoadsByModel,
	fetchImputationResults,
	fetchTimeInterval,
} from '../services/imputation/imputation.api';
import {
	ModelMetrics,
	Road,
	TimeInterval,
	ImputationResult,
	ModelType,
	Healthcheck
} from '../services/imputation';
import { transformImputationData, mergeMultipleModels, ChartDataPoint } from '../lib/chart-utils';

// Dynamic import for charting component
const TimeSeriesChart = dynamic(() => import('./TimeSeriesChart'), {
	ssr: false,
	loading: () => (
		<div className="h-96 flex items-center justify-center border rounded-lg bg-card">
			<div className="text-center space-y-2">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
				<p className="text-sm text-muted-foreground">Loading chart...</p>
			</div>
		</div>
	),
});

type ChartMode = 'single' | 'comparison' | 'configurations' | 'error';

export default function Group6Client() {
	// date from api states
	const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
	const [modelType, setModelType] = useState<ModelType[]>([]);
	const [roads, setRoads] = useState<Road[]>([]);
	const [timeIntervals, setTimeintervals] = useState<TimeInterval[]>([]);

	// user selection state
	const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
	const [selectedRoad, setSelectedRoad] = useState<string | null>(null);
	const [selectedTimeRange, setSelectedTimeRange] = useState<any>(null);
	const [chartMode, setChartMode] = useState<ChartMode>('single');

	// chart data state
	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

	// ui state
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);


	//  Load initial data (model types and metrics only)
	useEffect(() => {
		async function loadInitialData() {
			try {
				setLoading(true);
				setError(null);

				// Fetch model types first
				const modelTypesData = await fetchModelTypes();
				setModelType(modelTypesData);

				// Fetch metrics for all model types
				const allMetricsPromises: Promise<ModelMetrics[]>[] = modelTypesData.map(type =>
					fetchModelMetrics(type.id)
				);

				// Use allSettled to handle 404s gracefully - some model types may not have metrics yet
				const allMetricsResults = await Promise.allSettled(allMetricsPromises);
				const flatMetrics = allMetricsResults
					.filter((result): result is PromiseFulfilledResult<ModelMetrics[]> => result.status === 'fulfilled')
					.flatMap(result => result.value);

				console.log(`[Group6Client] Loaded ${flatMetrics.length} model metrics from ${modelTypesData.length} model types`);
				setModelMetrics(flatMetrics);

			} catch (err) {
				console.error('Failed to load initial data:', err);
				setError(err instanceof Error ? err.message : 'Failed to load data');
			} finally {
				setLoading(false);
			}
		}

		loadInitialData();
	}, []);

	// Fetch roads when models are selected
	useEffect(() => {
		if (selectedModelIds.length === 0) {
			setRoads([]);
			return;
		}

		async function loadRoads() {
			try {
				setError(null);

				// Fetch roads for each selected model
				const roadsByModelPromises = selectedModelIds.map(id =>
					fetchRoadsByModel(id)
				);

				const roadsByModelArrays = await Promise.all(roadsByModelPromises);

				// Merge all roads and remove duplicates by road_id
				const roadsData = Array.from(
					new Map(roadsByModelArrays
						.flat()
						.map(road => [road.road_id, road]))
						.values()
				);
				setRoads(roadsData);

			} catch (err) {
				console.error('Failed to load roads:', err);
				setError(err instanceof Error ? err.message : 'Failed to load roads');
			}
		}

		loadRoads();
	}, [selectedModelIds]);

	// Fetch time intervals when models and road are selected
	useEffect(() => {
		if (selectedModelIds.length === 0 || !selectedRoad) {
			setTimeintervals([]);
			return;
		}

		const roadId = selectedRoad;
		async function loadTimeIntervals() {
			try {
				setError(null);

				console.log(`[loadTimeIntervals] Starting with:`);
				console.log(`  selectedModelIds:`, selectedModelIds);
				console.log(`  roadId:`, roadId);

				// Fetch time intervals for each model-road combination
				const timeIntervalPromises = selectedModelIds.map(modelId => {
					console.log(`  Creating promise for modelId: ${modelId}, roadId: ${roadId}`);
					return fetchTimeInterval(modelId, roadId);
				});

				const timeIntervalsArray = await Promise.all(timeIntervalPromises);
				// Deduplicate time intervals by start_time
				// Each promise returns a single TimeInterval object, so timeIntervalsArray is TimeInterval[]
				const timeIntervalData = Array.from(
					new Map(timeIntervalsArray
						.map(time => [time.start_time, time]))
						.values()
				);

				setTimeintervals(timeIntervalData);

			} catch (err) {
				console.error('Failed to load time intervals:', err);
				setError(err instanceof Error ? err.message : 'Failed to load time intervals');
			}
		}

		loadTimeIntervals();
	}, [selectedModelIds, selectedRoad]);

	// Fetch chart data when all required selections are made
	useEffect(() => {
		if (!selectedModelIds || !selectedRoad || !selectedTimeRange || selectedModelIds.length === 0) {
			setChartData([]);
			return;
		}

		// Capture the non-null values to preserve type narrowing in async closure
		const roadId = selectedRoad;
		const timeRange = selectedTimeRange;

		async function loadChartData() {
			try {
				setError(null);

				// Use the Unix timestamps directly from timeIntervals (already in seconds)
				// Since we deduplicate time intervals, all models have the same range
				const startTimeUnix = timeIntervals.length > 0 ? timeIntervals[0].start_time : 0;
				const endTimeUnix = timeIntervals.length > 0 ? timeIntervals[0].end_time : 0;

				// Fetch imputation results for each selected model
				const imputationResultsPromises: Promise<ImputationResult[]>[] = selectedModelIds.map(modelId =>
					fetchImputationResults(
						modelId,
						roadId,
						startTimeUnix,
						endTimeUnix
					)
				);

				const imputationResultsArray = await Promise.allSettled(imputationResultsPromises);

				// Extract successful results (keep per-model arrays separate)
				const successfulResults = imputationResultsArray
					.filter((result): result is PromiseFulfilledResult<ImputationResult[]> =>
						result.status === 'fulfilled'
					)
					.map(result => result.value);

				console.log(`[Group6Client] Loaded results from ${successfulResults.length} models`);

				// Transform to chart format based on number of models
				let transformedData: ChartDataPoint[];
				if (successfulResults.length === 0) {
					transformedData = [];
				} else if (successfulResults.length === 1) {
					// Single model - use simple transformation
					transformedData = transformImputationData(successfulResults[0]);
				} else {
					// Multiple models - merge for comparison
					transformedData = mergeMultipleModels(successfulResults);
				}

				console.log(`[Group6Client] Transformed to ${transformedData.length} chart data points`);
				setChartData(transformedData);

			} catch (err) {
				console.error('Failed to load chart data:', err);
				setError(err instanceof Error ? err.message : 'Failed to load chart data');
			}
		}

		loadChartData();
	}, [selectedModelIds, selectedRoad, selectedTimeRange, modelMetrics]);


	// derived data for rendering
	const selectedModelNames = modelMetrics
		.filter(m => selectedModelIds.includes(m.id))
		.map(m => m.model_type);

	// Calculate available time range from time intervals
	const availableTimeRange = timeIntervals.length > 0
		? {
			start: new Date(Math.min(...timeIntervals.map(ti => ti.start_time * 1000))).toISOString(),
			end: new Date(Math.max(...timeIntervals.map(ti => ti.end_time * 1000))).toISOString()
		}
		: null;


	// render
	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center h-96">
					<div className="text-center space-y-4">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
						<p className="text-muted-foreground">Loading traffic imputation system...</p>
					</div>
				</div>
			</div>
		);
	}

	

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Traffic Data Imputation - Group 6</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Graph Neural Network-based traffic speed prediction
					</p>
				</div>
				<div className="text-right text-sm text-muted-foreground">
					<p>{modelType.length} models available</p>
					<p>{chartData.length} data points loaded</p>
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
					<p className="font-semibold">Error</p>
					<p className="text-sm">{error}</p>
				</div>
			)}

			{/* Control Panel */}
			<div className="grid grid-rows-1 md:grid-cols-1 ">

				<ModelSelector
				modelType={modelType}
					modelMetrics={modelMetrics}
					selectedModels={selectedModelIds}
					onSelectionChange={setSelectedModelIds}
					maxSelection={2}
				/>

				<RoadSegmentSelector
					roads={roads}
					selectedRoadId={selectedRoad}
					onSelect={setSelectedRoad}
					loading={loading}
				/>

				{availableTimeRange && (
					<TimeIntervalSelector
						availableRange={availableTimeRange}
						selectedRange={selectedTimeRange || availableTimeRange}
						onSelect={setSelectedTimeRange}
					/>
				)}
			</div>

			{/* Chart */}
			<div className="border rounded-lg p-6 bg-card">
				{chartData.length > 0 ? (
					<TimeSeriesChart
						data={chartData}
						mode={chartMode}
						onModeChange={setChartMode}
						modelNames={selectedModelNames}
					/>
				) : (
					<div className="h-96 flex items-center justify-center">
						<div className="text-center space-y-2">
							<p className="text-muted-foreground">
								{selectedModelIds.length === 0
									? 'Select a model to view data'
									: selectedRoad === null
										? 'Select a road segment to view data'
										: 'Loading chart data...'}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Metrics Summary */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{selectedModelIds.map(modelId => {
					const model = modelMetrics.find(m => m.id === modelId);
					if (!model) return null;

					// Get the  model type name
					const modelTypeName = modelType.find(mt => mt.id === model.model_type)?.name || model.model_type;

					// Extract test metrics (prioritize test over validation)
					const testMetrics = model.loss?.filter(l => l.type?.toLowerCase() === 'test') || [];
					const validationMetrics = model.loss?.filter(l => l.type?.toLowerCase() === 'validation') || [];
					const displayMetrics = testMetrics.length > 0 ? testMetrics : validationMetrics;

					return (
						<div key={modelId} className="border rounded-lg p-4 bg-card">
							<div className="mb-3">
								<h3 className="font-semibold text-base">{modelTypeName}</h3>
								<p className="text-xs text-muted-foreground truncate" title={model.id}>
									Model ID: {model.id.substring(0, 8)}
								</p>
							</div>
							<div className="space-y-2 text-sm">
								{displayMetrics.length > 0 ? (
									<>
										<div className="text-xs text-muted-foreground mb-1">
											{testMetrics.length > 0 ? 'Test' : 'Validation'} Metrics:
										</div>
										{displayMetrics.map((metric, idx) => (
											<div key={idx} className="flex justify-between">
												<span className="text-muted-foreground uppercase">
													{metric.loss_unit}:
												</span>
												<span className="font-medium">
													{metric.loss_value.toFixed(2)}
												</span>
											</div>
										))}
									</>
								) : (
									<div className="text-muted-foreground italic">No metrics available</div>
								)}
								<div className="flex justify-between border-t pt-2 mt-2">
									<span className="text-muted-foreground">Training Time:</span>
									<span className="font-medium">{model.train_time_min} min</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApiResponse, ChartDataItem } from '../types';
import { useEffect, useState } from 'react';
import TimeSeriesChart from '../TimeSeriesChart';

interface DatasetMetadata {
    id: number;
    name: string;
    num_entries: number;
    num_columns: number;
    columns: string[];
    start_datetime: string | null;
    end_datetime: string | null;
}

export default function MyDetailPage() {
const searchParams = useSearchParams();
const datasetName = searchParams.get('name') || 'Dataset';
const datasetId = searchParams.get('id') || 'Unknown';

const convertApiDataToChartFormat = (apiResponse: ApiResponse): ChartDataItem[] => {
    if (!apiResponse || !apiResponse.items || !Array.isArray(apiResponse.items)) {
        console.error('Invalid API response:', apiResponse);
        return [];
    }
    return apiResponse.items.map((item) => ({
        date: item.time,
        value: item.value
    }))
}

const anomalyRanges = [
    { start: "2024-01-01T12:00:00", end: "2024-01-01T12:30:00" },
];

const [chartData, setChartData] = useState<ChartDataItem[]>([]);
const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
const [selectedChartType, setSelectedChartType] = useState('time-series');
const [predictionFetched, setPredictionFetched] = useState(false);

const chartTypes = [
    { value: 'time-series', label: 'Time Series' },
    { value: 'histogram', label: 'Histogram' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'box-plot', label: 'Box Plot' },
    { value: 'heatmap', label: 'Heatmap' },
];
    
    useEffect(() => {
        const fetchData = async () => { 
            try {
                const res = await fetch(`http://127.0.0.1:8000/datasets/${datasetId}/records?size=24`);
                if (!res.ok) {
                    throw new Error(`API error: ${res.status} ${res.statusText}`);
                }
                const apiData: ApiResponse = await res.json();
                console.log('Has items?', !!apiData.items);
                setChartData(convertApiDataToChartFormat(apiData));
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setChartData([]);
            }
        }
        fetchData();
    }, [datasetId]);

    useEffect(() =>{
        const fetchPrediction = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8002/forecasting/${datasetId}`);
                if(!res.ok){
                    throw new Error(`Prediction API error: ${res.status}`);
                }
                const predictionData = await res.json();

                // predictionData is an array, each item has a 'predictions' property
                if (Array.isArray(predictionData) && predictionData[0]?.predictions) {
                    const allPredictions: ChartDataItem[] = [];
                    
                    // Get the latest date from existing chart data
                    let latestDate: Date | null = null;
                    if (chartData.length > 0) {
                        const lastDataPoint = chartData[chartData.length - 1];
                        latestDate = new Date(lastDataPoint.date);
                    }
                    
                    predictionData.forEach((item: Record<string, unknown>) => {
                        if (Array.isArray(item.predictions)) {
                            const formattedData = item.predictions.map((pred: Record<string, unknown>, index: number) => {
                                // Calculate date at 30-minute intervals from the latest date
                                let predDate = '';
                                if (latestDate) {
                                    const newDate = new Date(latestDate);
                                    newDate.setHours(newDate.getHours() + (index + 1));
                                    predDate = newDate.toISOString();
                                } else {
                                    predDate = String(pred.time || pred.date || pred.timestamp || '');
                                }
                                
                                return {
                                    date: predDate,
                                    value: Number(pred.value || pred.prediction || pred.forecast || 0)
                                };
                            });
                            allPredictions.push(...formattedData);
                        }
                    });
                    setChartData(prev => [...prev, ...allPredictions]);
                }
                else if (Array.isArray(predictionData)) {
                    const formattedData: ChartDataItem[] = predictionData.map((item: Record<string, unknown>) => ({
                        date: String(item.time || item.date || item.timestamp || ''),
                        value: Number(item.value || item.prediction || item.forecast || 0)
                    }));
                    setChartData(prev => [...prev, ...formattedData]);
                }
                else {
                    console.warn('Invalid prediction response structure:', predictionData);
                }
                setPredictionFetched(true);
            } catch (error) {
                console.error('Error fetching prediction:', error);
                setPredictionFetched(true);
            }
        }

        if(chartData.length > 0 && !predictionFetched) {
            fetchPrediction();
        }
    }, [datasetId, chartData.length, predictionFetched])

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setIsLoadingMetadata(true);
                const res = await fetch(`http://127.0.0.1:8000/datasets/${datasetId}`);
                const data: DatasetMetadata = await res.json();
                setMetadata(data);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            } finally {
                setIsLoadingMetadata(false);
            }
        }
        setPredictionFetched(false);
        fetchMetadata();
    }, [datasetId]);

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

return (
    <div className="min-h-screen bg-background">
    <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-2">Details for {datasetName}</h1>
        <p className="text-sm text-muted-foreground mb-6">Dataset ID: {datasetId}</p>

        <div className="grid grid-cols-1 gap-6">
          {/* Dataset Visualization Card */}
        <Card>
            <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Dataset Visualization</CardTitle>
                    <CardDescription>Visual representation of your time series data</CardDescription>
                </div>
                {/* Chart Type Selector */}
                <div className="min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">Chart Type</label>
                    <select
                        value={selectedChartType}
                        onChange={(e) => setSelectedChartType(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    >
                        {chartTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <div className="w-full">
                {selectedChartType === 'time-series' ? (
                    <TimeSeriesChart chartData={chartData} anomalyRanges={anomalyRanges} />
                ) : (
                    <div className="bg-muted rounded-lg border border-border min-h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">
                            {chartTypes.find(t => t.value === selectedChartType)?.label} visualization will appear here
                        </p>
                    </div>
                )}
            </div>

            {/* Metadata Section */}
            <Separator className="my-6" />
            <div>
                <h3 className="text-lg font-semibold mb-4">Dataset Metadata</h3>
                {isLoadingMetadata ? (
                    <p className="text-sm text-muted-foreground">Loading metadata...</p>
                ) : metadata ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Dataset Name</p>
                            <p className="text-sm font-medium">{metadata.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Entries</p>
                            <p className="text-sm font-medium">{metadata.num_entries.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Columns</p>
                            <p className="text-sm font-medium">{metadata.num_columns} ({metadata.columns.join(', ')})</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p className="text-sm font-medium">{formatDateTime(metadata.start_datetime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">End Date</p>
                            <p className="text-sm font-medium">{formatDateTime(metadata.end_datetime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Dataset ID</p>
                            <p className="text-sm font-medium">{metadata.id}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Unable to load metadata</p>
                )}
            </div>
            </CardContent>
        </Card>
        </div>
    </main>
    </div>
);
}

"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApiResponse, ChartDataItem } from '../../types';
import { useEffect, useState } from 'react';
import TimeSeriesChart from '../../TimeSeriesChart';

interface DatasetMetadata {
    id: number;
    name: string;
    num_entries: number;
    num_columns: number;
    columns: string[];
    start_datetime: string | null;
    end_datetime: string | null;
}

export interface Analysis {
    id: number;
    detection_method: string;
    name: string;
    description: string;
    status: string;
}

interface AnomalyRange {
    start: string;
    end: string;
}

export default function MyDetailPage() {
const { id } = useParams();

const convertApiDataToChartFormat = (apiResponse: ApiResponse): ChartDataItem[] => {
    return apiResponse.items.map((item) => ({
    date: item.time,
    value: item.value
    }))
}

const [chartData, setChartData] = useState<ChartDataItem[]>([]);
const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
const [analyses, setAnalyses] = useState<Analysis[]>([]);
const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
const [anomalyRanges, setAnomalyRanges] = useState<AnomalyRange[]>([]);
const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);
    
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setIsLoadingMetadata(true);
                const res = await fetch(`http://127.0.0.1:8000/datasets/${id}`);
                const data: DatasetMetadata = await res.json();
                setMetadata(data);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            } finally {
                setIsLoadingMetadata(false);
            }
        }
        fetchMetadata();
    }, [id]);

    useEffect(() => {
        const fetchData = async () => { 
        const res = await fetch(`http://127.0.0.1:8000/datasets/${id}/records?size=10000`);
        const apiData: ApiResponse = await res.json();
        setChartData(convertApiDataToChartFormat(apiData));
    }
    fetchData();
    }, [id]);

    useEffect(() => {
        const fetchAnalyses = async () => {
            try {
                setIsLoadingAnalyses(true);
                const res = await fetch(`http://127.0.0.1:8000/datasets/${id}/analyses`);
                const data = await res.json();
                console.log('Fetched analyses data:', data);
                
                const analysesArray = Array.isArray(data) ? data : (data.analyses || []);
                setAnalyses(analysesArray);
                
                if (analysesArray.length > 0) {
                    setSelectedAnalysisId('');
                }
            } catch (error) {
                console.error('Error fetching analyses:', error);
                setAnalyses([]);
            } finally {
                setIsLoadingAnalyses(false);
            }
        }
        fetchAnalyses();
    }, [id]);

    useEffect(() => {
        const fetchAnomalyRanges = async () => {
            if (!selectedAnalysisId) {
                setAnomalyRanges([]);
                return;
            }
            
            try {
                setIsLoadingAnomalies(true);
                const res = await fetch(`http://127.0.0.1:8000/analyses/${selectedAnalysisId}`);
                const data = await res.json();
                setAnomalyRanges(data.items || []);
            } catch (error) {
                console.error('Error fetching anomaly ranges:', error);
                setAnomalyRanges([]);
            } finally {
                setIsLoadingAnomalies(false);
            }
        }
        fetchAnomalyRanges();
    }, [selectedAnalysisId]);

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
        <h1 className="text-3xl font-semibold mb-2">Details for {metadata?.name}</h1>
1
        <div className="grid grid-cols-1 gap-6">
          {/* Dataset Visualization Card */}
        <Card>
            <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Dataset Visualization</CardTitle>
                    <CardDescription>Visual representation of your time series data</CardDescription>
                </div>
                {/* Analysis Selector */}
                <div className="min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">Analysis</label>
                    <select
                        value={selectedAnalysisId}
                        onChange={(e) => setSelectedAnalysisId(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        disabled={isLoadingAnalyses || analyses.length === 0}
                    >
                        {isLoadingAnalyses ? (
                            <option>Loading analyses...</option>
                        ) : analyses.length === 0 ? (
                            <option>No analyses available</option>
                        ) : (
                            <>
                                <option value="">Choose...</option>
                                {analyses.map((analysis) => (
                                    <option key={analysis.id} value={analysis.id.toString()}>
                                        {analysis.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <div className="w-full">
                {isLoadingAnomalies ? (
                    <div className="bg-muted rounded-lg border border-border min-h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Loading anomaly data...</p>
                    </div>
                ) : (
                    <TimeSeriesChart chartData={chartData} anomalyRanges={anomalyRanges} />
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

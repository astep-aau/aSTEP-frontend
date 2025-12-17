"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Analysis } from './[id]/page';

// Define the interface for the dataset object from your backend
interface Dataset {
    id: number;
    name: string;
    num_entries: number;
    analyses: Analysis[];
}

// Some backends include `status` on analyses; extend the imported `Analysis`
type AnalysisWithStatus = Analysis & { status?: string };

export default function MyDatasetPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://127.0.0.1:8000/datasets');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch datasets: ${response.statusText}`);
            }
            
            const data = await response.json();
            setDatasets(data.datasets);
            setError(null);
        } catch (err) {
            console.error('Error fetching datasets:', err);
            setError(err instanceof Error ? err.message : 'Failed to load datasets');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-8 max-w-6xl">
                <h1 className="text-3xl font-semibold mb-8">Data Management</h1>
                
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Existing Time Series Datasets</CardTitle>
                                <CardDescription>Manage and analyze your uploaded datasets</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/group9/upload">
                                    <Plus className="mr-2 size-4" />
                                    Upload New Dataset
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4 pt-6">
                        {isLoading && (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading datasets...
                            </div>
                        )}
                        
                        {error && (
                            <div className="text-center py-8 text-destructive">
                                Error: {error}
                            </div>
                        )}
                        
                        {!isLoading && !error && datasets.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No datasets found. Upload your first dataset to get started!
                            </div>
                        )}
                        
                        {!isLoading && !error && datasets.map((dataset) => (
                            <Card key={dataset.id} className="shadow-none">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        {/** show spinner when any analysis is pending or processing */}
                                        {(() => {
                                            const hasPending = (dataset.analyses as AnalysisWithStatus[])
                                                .some(a => a.status === 'pending' || a.status === 'processing');
                                            return (
                                                <p className="text-lg font-medium">
                                                    {dataset.name}
                                                    {hasPending && (
                                                        <svg
                                                            className="animate-spin inline-block ml-2 h-4 w-4 text-primary"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                        >
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                        </svg>
                                                    )}
                                                </p>
                                            );
                                        })()}
                                        <p className="text-sm text-muted-foreground">
                                            Entries: {dataset.num_entries}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/group9/datasets/${dataset.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href={`/group9/analysis/${dataset.id}`}>
                                                Run Analysis
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
"use client";

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Define the interface for the dataset object
interface Dataset {
    id: number;
    name: string;
    uploaded: string;
    size: string;
}

export default function MyDatasetPage() {

    const datasets: Dataset[] = [
        { id: 1, name: 'Aalborg Power Consumption', uploaded: '2025-10-20', size: '1.2 MB' },
        { id: 2, name: 'Traffic Speeds', uploaded: '2025-10-20', size: '1.2 MB' },
    ];

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
                                <Link href="/group9/Upload">
                                    <Plus className="mr-2 size-4" />
                                    Upload New Dataset
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4 pt-6">
                        {datasets.map((dataset) => (
                            <Card key={dataset.id} className="shadow-none">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-lg font-medium">{dataset.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            ID: {dataset.id} • Uploaded: {dataset.uploaded} • Size: {dataset.size}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href={`/group9/Analysis/${dataset.id}`}>
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
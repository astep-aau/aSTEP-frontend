"use client";

import React from 'react';
import { Plus } from 'lucide-react';

// Define the type for the possible pages
type Page = 'MyDatasetPage' | 'UploadPage' | 'AnalysisPage';

interface MyDatasetPageProps {
    setActivePage: (page: Page) => void;
}

// Define the interface for the dataset object
interface Dataset {
    name: string;
    uploaded: string;
    size: string;
}

export default function MyDatasetPage({ setActivePage }: MyDatasetPageProps) {

    const datasets: Dataset[] = [
        { name: 'Aalborg Power Consumption', uploaded: '2025-10-20', size: '1.2 MB' },
        { name: 'Traffic Speeds', uploaded: '2025-10-20', size: '1.2 MB' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
            <div className="container mx-auto px-6 py-8 max-w-6xl">
                <h1 className="text-3xl font-semibold mb-8">Data Management</h1>
                
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                    
                    {/* Header with Upload Button */}
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="text-xl font-medium text-gray-800 dark:text-white">Existing Time Series Datasets</h2>
                        <button 
                            onClick={() => setActivePage('UploadPage')}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 transform hover:scale-[1.02]"
                        >
                            <Plus size={20} className="mr-2" />
                            Upload New Dataset
                        </button>
                    </div>

                    {/* Dataset Cards */}
                    <div className="space-y-4">
                        {datasets.map((dataset, index) => (
                            <div 
                                key={index} 
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700"
                            >
                                <div>
                                    <p className="text-lg font-medium text-gray-800 dark:text-white">{dataset.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Uploaded: {dataset.uploaded} | Size: {dataset.size}
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <button 
                                        className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        onClick={() => setActivePage('AnalysisPage')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                                    >
                                        Run Analysis
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
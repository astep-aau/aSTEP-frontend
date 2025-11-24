"use client";

import { useParams } from 'next/navigation';

export default function AnalysisPage() {
    const params = useParams();
    const datasetId = params?.id as string;

return (
    <div className="bg-gray-100 dark:bg-black min-h-screen"> 
        <div className="container mx-auto px-6 py-8 max-w-6xl">
            {datasetId && (
                <h1 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
                    Analysis for: {datasetId}
                </h1>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-1 flex flex-col gap-8">

                    {/* 2. Outlier Detection Panel */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 h-fit">
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 text-gray-800 dark:text-white">Outlier Detection</h2>

                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Select Method</p>
                    <div className="space-y-4">
                        {['Isolation Forest', 'One-Class SVM', 'Z-Score Method'].map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <input
                            type="radio"
                            name="outlier-method"
                            defaultChecked={index === 0}
                            className="form-radio h-4 w-4 text-green-600 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 focus:ring-green-500"
                            />
                            <span className="ml-3 text-gray-700 dark:text-gray-200">{option}</span>
                        </label>
                        ))}
                    </div>

                    <button
                        disabled
                        className="w-full mt-6 py-3 px-4 font-bold rounded-xl text-white transition duration-150 transform shadow-md bg-green-600 hover:bg-green-700 hover:scale-[1.005]"
                    >
                        Start Outlier Detection
                    </button>
                    </div>
                </div>

                {/* 3. Visualization/Results Placeholder */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 min-h-[300px] flex items-center justify-center">
                        <p className="text-gray-400 dark:text-gray-600">Visualization/Results will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
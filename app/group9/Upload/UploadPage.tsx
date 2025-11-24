// UploadPage.js
"use client";

import React from 'react';
import { Upload } from 'lucide-react';

export default function UploadPage() {
return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
    <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Group 9: Data Analysis Pipeline UI</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
            Interface for uploading time series data and configuring analysis tasks.
        </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        
            <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 1. Upload Data Panel */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-semibold mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 text-gray-800 dark:text-white">Upload Data File</h2>

              {/* Drag & Drop Area */}
                <div className="h-64 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
                <Upload size={48} className="text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Drag & Drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or</p>
                <input type="file" id="file-input" accept=".csv" className="hidden" />
                <label 
                htmlFor="file-input"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 transform hover:scale-[1.02] cursor-pointer"
                >
                Browse Files
                </label>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Supports: CSV (Comma Separated Values)</p>
            </div>
            
              {/* Static Upload Button */}
            <button
                disabled
                className="w-full mt-6 py-3 px-4 font-bold rounded-xl text-white bg-green-600 opacity-75 cursor-not-allowed shadow-md hover:bg-green-500"
            >
                Start Data Upload
            </button>
            </div>
        </div>
        {/* Upload Guidelines Card (Sidebar) */}
        <div className="hidden lg:block">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Data Guidelines</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>File format **must** be CSV.</li>
                <li>Data should be structured as a time series.</li>
                <li>The first column should contain date/time stamps.</li>
                <li>Maximum file size is 50MB.</li>
                <li>All values should be numerical (except the timestamp).</li>
            </ul>
            </div>
        </div>
    </div>
    </div>
    </div>
);
}
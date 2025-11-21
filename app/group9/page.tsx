"use client";

import React, { useState } from 'react';

// Import all page and component files
import Navbar from './Navbar';
import MyDatasetPage from './MyDatasetPage';
import UploadPage from './UploadPage';
import AnalysisPage from './AnalysisPage';
import { ChartDataItem, ApiResponse, AnomalyRange } from "./types"

// Define the types for the pages
type Page = 'MyDatasetPage' | 'UploadPage' | 'AnalysisPage';

  const convertApiDataToChartFormat = (apiResponse: ApiResponse): ChartDataItem[] => {
    return apiResponse.items.map((item) => ({
      date: item.time,
      value: item.value
    }))
  }

export default function Home() {
    // State is typed as Page
    const [activePage, setActivePage] = useState<Page>('MyDatasetPage');

    const renderPage = () => {
        switch (activePage) {
            case 'MyDatasetPage':
                return <MyDatasetPage setActivePage={setActivePage} />;
            case 'UploadPage':
                return <UploadPage />;
            case 'AnalysisPage':
                return <AnalysisPage />;
            default:
                return <MyDatasetPage setActivePage={setActivePage} />;
        }
    };
  return (
        <div className="bg-white dark:bg-black min-h-screen">
            {/* Navbar component is always visible */}
            <Navbar 
                activePage={activePage} 
                setActivePage={setActivePage} 
            />
            
            <main>
                {renderPage()}
            </main>
        </div>
    );
}
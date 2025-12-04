"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const datasetName = searchParams.get('name') || 'Datasets';
  const [selectedOption, setSelectedOption] = useState('option1');

  const handleStartAnalysis = () => {
    console.log('Starting outlier detection with:', selectedOption);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-2">Analysis for {datasetName}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outlier Detection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Outlier Detection</CardTitle>
              <CardDescription>Select a detection method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {/* Option 1 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="option1"
                    name="outlier-method"
                    value="option1"
                    checked={selectedOption === 'option1'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="option1" className="cursor-pointer font-normal">
                    Option 1
                  </label>
                </div>

          <Card>
            <CardHeader>
              <CardTitle>Forecasting</CardTitle>
              <CardDescription>Choose a forecasting model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {/* Option 1 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="option1"
                    name="Forecasting energy"
                    value="option1"
                    checked={selectedOption === 'option1'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="option4" className="cursor-pointer font-normal">
                    Option 1
                  </label>
              </div>

                {/* Option 2 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="option2"
                    name="outlier-method"
                    value="option2"
                    checked={selectedOption === 'option2'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="option2" className="cursor-pointer font-normal">
                    Option 2
                  </label>
                </div>

                {/* Option 3 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="option3"
                    name="outlier-method"
                    value="option3"
                    checked={selectedOption === 'option3'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="option3" className="cursor-pointer font-normal">
                    Option 3
                  </label>
                </div>
              </div>

              {/* Start Button */}
              <Button onClick={handleStartAnalysis} className="w-full">
                Start Outlier Detection
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Results/Visualization Area */}
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Results will appear here
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

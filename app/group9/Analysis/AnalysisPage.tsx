"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationAutocomplete } from "@/components/LocationAutocomplete";


export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const datasetName = searchParams.get('name') || 'Datasets';
  const [selectedOption, setSelectedOption] = useState('option1');
  const [datasetLocation, setDatasetLocation] = useState<string>("");
  const [processingType, setProcessingType] = useState("forecast");
  
  const handleStartAnalysis = () => {
    if (!datasetLocation && processingType == "forecast") {
      alert("Forecast needs a location to function");
      return;
    }

    console.log('Predicting energy for the next', selectedOption);
  
  
  };

  const handleLocationSelect = (loc: { name: string }) => {
    setDatasetLocation(loc.name);

    // Example wttr.in usage
    // fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`)
  };

  const handleForecastOption = (name: string) => {
    setSelectedOption(name);
    setProcessingType("forecast");
  }

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
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Forecasting</CardTitle>
              <CardDescription>Choose for how long you would like to predict energy usage:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {/* Option 1 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="15min"
                    name="Forecasting energy"
                    value="15min"
                    checked={selectedOption === '15min'}
                    onChange={(e) => handleForecastOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="15min" className="cursor-pointer font-normal">
                    15 minutes
                  </label>
              </div>

                {/* Option 2 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="30min"
                    name="outlier-method"
                    value="30min"
                    checked={selectedOption === '30min'}
                    onChange={(e) => handleForecastOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="30min" className="cursor-pointer font-normal">
                    30 minutes
                  </label>
                </div>

                {/* Option 3 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="60min"
                    name="outlier-method"
                    value="60min"
                    checked={selectedOption === '60min'}
                    onChange={(e) => handleForecastOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="60min" className="cursor-pointer font-normal">
                    1 hour
                  </label>
                </div>
              </div>
              
              <div>
                <LocationAutocomplete onSelect={handleLocationSelect} />
              </div>

              {/* Start Button */}
              <Button onClick={handleStartAnalysis} className="w-full">
                Start Forecasting
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

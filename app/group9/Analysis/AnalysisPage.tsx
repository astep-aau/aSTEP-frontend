"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ApiResponse } from '../types';

type DataPoint = { time: string; value: number };

export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetName = searchParams.get('name') || 'Datasets';
  const datasetId = searchParams.get('id') || 'Unknown';
  const [selectedOption, setSelectedOption] = useState('option1');
  const [datasetLocation, setDatasetLocation] = useState<string>("");
  const [processingType, setProcessingType] = useState("forecast");
  const [lastDatapoints, setLastDatapoints] = useState<DataPoint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  useEffect(() => {
    const fetchLastDatapoints = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`http://127.0.0.1:8000/datasets/${datasetId}/records?size=10000`);
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const apiData: ApiResponse = await res.json();
        
        console.log('AnalysisPage API Response:', apiData);
        console.log('Has items?', !!apiData.items);
        
        if (apiData.items && Array.isArray(apiData.items)) {
          setLastDatapoints(apiData.items.slice(-48));
        } else {
          console.error('No items array in response');
          setLastDatapoints([]);
        }
      } catch (error) {
        console.error('Error fetching datapoints:', error);
        setLastDatapoints([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (datasetId && datasetId !== 'Unknown') {
      fetchLastDatapoints();
    }
  }, [datasetId]);

  const handleStartAnalysis = async () => {
    if (!datasetId) {
      alert("Dataset ID is missing");
      return;
    }
    if (!datasetLocation && processingType == "forecast") {
      alert("Forecast needs a location to function");
      return;
    }

    console.log('Predicting energy for the next', selectedOption);
    console.log('Last 24 datapoints:', lastDatapoints);
    await handleAnalysis(lastDatapoints);
    // Redirect to detail page
    router.push(`/group9/DetailPage?id=${datasetId}&name=${encodeURIComponent(datasetName)}`);
  };

  const handleLocationSelect = (loc: { name: string }) => {
    setDatasetLocation(loc.name.substring(0, loc.name.indexOf(',')));

    // Example wttr.in usage
    // fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`)
  };

  const handleForecastOption = (name: string) => {
    setSelectedOption(name);
    setProcessingType("forecast");
  }

  const handleAnalysis = async (userData: DataPoint[]) =>{
    const values = userData.map(dp => dp.value);
    try{ 
      const url = `http://127.0.0.1:8002/forecast/${datasetId}?model_name=lstm&city=${datasetLocation}`;
      console.log('Forecast URL:', url);
      const res = await fetch(url,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error: ${res.status} ${res.statusText} - ${errText}` );
      }
      const data = await res.json();
      console.log('Analysis response:', data);
    }catch(error){
      console.error('Error during analysis:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-2">Analysis for {datasetName}</h1>
        <p className="text-sm text-muted-foreground mb-6">Dataset ID: {datasetId}</p>

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

                {/* Option 2 */}
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

                {/* Option 3 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="60min"
                    name="outlier-method"
                    value="12hours"
                    checked={selectedOption === '12hours'}
                    onChange={(e) => handleForecastOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="12hours" className="cursor-pointer font-normal">
                    12 hours
                  </label>
                </div>
              </div>
              
              <div>
                <LocationAutocomplete onSelect={handleLocationSelect} />
              </div>

              {/* Start Button */}
              <Button onClick={handleStartAnalysis} className="w-full" disabled={loadingData}>
                {loadingData ? 'Loading data...' : 'Start Forecasting'}
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

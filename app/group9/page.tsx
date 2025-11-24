"use client";

import { redirect } from 'next/navigation';
import React, { useState, useEffect} from 'react';
import { ChartDataItem, ApiResponse} from "./types"
import TimeSeriesChart from './TimeSeriesChart';

  const convertApiDataToChartFormat = (apiResponse: ApiResponse): ChartDataItem[] => {
    return apiResponse.items.map((item) => ({
      date: item.time,
      value: item.value
    }))
  }

  const anomalyRanges = [
    { start: "2024-01-01T12:00:00", end: "2024-01-01T12:30:00" },
  ];


export default function Home() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    
    useEffect(() => {
        const fetchData = async () => { 
        const res = await fetch("http://127.0.0.1:8000/datasets/1/records?size=10000");
        const apiData: ApiResponse = await res.json();
        setChartData(convertApiDataToChartFormat(apiData));
      }
      fetchData();
    }, []);

  return (
    <TimeSeriesChart chartData={chartData} anomalyRanges={anomalyRanges} />
    );
}
import { ImputationResult } from "@/app/group6/services/imputation";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ params: string[] }> }
) {
    try {
        const urlParams = await params;
        const [modelId, roadId, startTime, endTime] = urlParams.params;

        // Validate parameters
        if (!modelId || !roadId || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required parameters: modelId, roadId, startTime, endTime' },
                { status: 400 }
            );
        }

        const USE_MOCKS = process.env.USE_MOCKS === 'true';

        if (USE_MOCKS) {
            // Mock mode - returns frontend format directly
            const { getMockImputationResults } = await import('@/app/group6/services');
            const data = getMockImputationResults(
                modelId,
                roadId,
                Number(startTime),
                Number(endTime)
            );
            await new Promise(resolve => setTimeout(resolve, 500));

            if (data) {
                return NextResponse.json({ results: [data] });
            }

            return NextResponse.json(
                { error: 'Mocked imputation data not found' },
                { status: 501 }
            );
        }
        
        const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
        const response = await fetch(
            `${baseurl}/impute-result/${modelId}/${roadId}/${startTime}/${endTime}/`
        );
        

        if (!response.ok) {
            return NextResponse.json(
                { error: `Backend error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }
        const imputationResult = await response.json();
        return NextResponse.json(imputationResult);

    } catch (error) {
        console.error('Imputation results API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch imputation results' },
            { status: 500 }
        );
    }
}
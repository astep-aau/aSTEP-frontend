import { NextRequest, NextResponse } from 'next/server';
import { ModelMetrics } from '@/app/group6/services/imputation';


export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ modelType: string }> }
) {
	const { modelType } = await params;
	const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
	const backendUrl = `${baseurl}/model-metrics/${modelType}/`;

	if (!modelType) {
		return NextResponse.json(
			{ error: `Missing required parameter: ${modelType}` },
			{ status: 400 }
		);
	}

	console.log(`[Model Metrics API] Fetching from backend: ${backendUrl}`);
	try {
		const response = await fetch(backendUrl);
		console.log(`[Model Metrics API] Backend response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[Model Metrics API] Backend error: ${response.status} ${errorText}`);

			return NextResponse.json(
				{
					error: `Backend API error: ${response.statusText}`,
					details: errorText,
					status: response.status,
					url: backendUrl
				},
				{ status: response.status }
			);
		}

		const modelMetrics: ModelMetrics[] = await response.json();
		console.log('[Model Metrics API] Backend data:', JSON.stringify(modelMetrics, null, 2));

		return NextResponse.json(modelMetrics);
	} catch (error) {
		console.error(`[Model Metrics API] Fetch error:`, error);

		return NextResponse.json(
			{
				error: `Failed to connect to backend`,
				details: error instanceof Error ? error.message : String(error),
				url: backendUrl
			},
			{ status: 503 }
		);
	}
}
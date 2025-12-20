import { NextRequest, NextResponse } from "next/server";
import { TimeInterval } from "@/app/group6/services/imputation";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ modelId: string, roadId: string }> }
) {
	const { modelId, roadId } = await params;
	const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
	const backendUrl = `${baseurl}/impute-result/time-interval/${modelId}/${roadId}`;

	console.log(`[Time Interval API] Fetching from backend: ${backendUrl}`);

	try {
		const response = await fetch(backendUrl);
		console.log(`[Time Interval API] Backend response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[Time Interval API] Backend error: ${response.status} ${errorText}`);

			return NextResponse.json(
				{
					error: `Backend API error: ${response.statusText}`,
					details: errorText,
					status:response.status,
					url: backendUrl
				},
				{ status: response.status }
			);
		}

		const data: TimeInterval = await response.json();
		console.log('[Time Interval API] Backend data:', JSON.stringify(data, null, 2));

		return NextResponse.json(data);

	} catch (error) {
		console.error(`[Time Interval API] Fetch error:`, error);
		
		return NextResponse.json(
			{
				error: 'Failed to connect to backend',
				details: error instanceof Error ? error.message : String(error),
				url: backendUrl
			},
			{ status: 503 }
		);
	}
}

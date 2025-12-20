import { NextRequest, NextResponse } from "next/server";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ modelId: string; roadId: string; startTime: string; endTime: string }> }
) {
	const { modelId, roadId, startTime, endTime } = await params;
	const baseurl = process.env.GROUP6_URL || "http://localhost:8000";
	const backendUrl = `${baseurl}/impute-result/${modelId}/${roadId}/${startTime}/${endTime}`;

	console.log(`[Imputation Data API] Fetching from: ${backendUrl}`);

	try {
		const response = await fetch(backendUrl);
		console.log(`[Imputation Data API] Backend response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[Imputation Data API] Backend error: ${response.status} ${response.statusText}`, errorText);

			return NextResponse.json({
				error: `Backend API error: ${response.statusText}`,
				details: errorText,
				status: response.status,
				url: backendUrl
			},
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log(`[Imputation Data] Received ${Array.isArray(data) ? data.length : 0} records`);

		return NextResponse.json(data);

	} catch (error) {
		console.error('[Imputation Data] Fetch error:', error);

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

import {
	NextRequest,
	NextResponse
} from "next/server";
import { Road } from "@/app/group6/services/imputation";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ modelId: string }> }
) {
	const { modelId } = await params;

	const USE_MOCKS = process.env.USE_MOCKS === 'true';
	if (USE_MOCKS) {
		const { getMockRoads } = await import(
			'@/app/group6/services'
		);
		const data = getMockRoads();
		await new Promise(resolve => setTimeout(resolve, 500));
		if (data) {
			return NextResponse.json(data);
		}
		return NextResponse.json(
			{ error: 'Mocked roads not found' },
			{ status: 501 });
	}

	const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
	const backendUrl = `${baseurl}/impute-result/roads/${modelId}/`;

	console.log(`[Roads API] Fetching from backend: ${backendUrl}`);

	try {
		const response = await fetch(backendUrl);

		console.log(`[Roads API] Backend response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[Roads API] Backend error: ${response.status} ${errorText}`);
			return NextResponse.json(
				{
					error: 'Backend API error',
					details: errorText,
					status: response.status,
					url: backendUrl
				},
				{ status: response.status }
			);
		}

		const roads: Road[] = await response.json();
		console.log(`[Roads API] Received ${roads.length} roads from backend`);

		// Backend returns an array of road objects — transform to { roads: Road[] }
		return NextResponse.json({ roads });
	} catch (error) {
		console.error(`[Roads API] Fetch error:`, error);
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
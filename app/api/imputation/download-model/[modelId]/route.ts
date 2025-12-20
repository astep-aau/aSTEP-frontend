import {
	NextResponse
} from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ modelId: string }> }
) {
	const { modelId } = await params;
	const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
	const backendUrl = `${baseurl}/downloadmodel/${modelId}/`

	console.log(`[Download Model API] Fetching from backend: ${backendUrl}`)


	try {
		const response = await fetch(backendUrl)
		console.log(`[Download Model API] Backend response status: ${response.status}`)

		if (!response.ok) {
			const errorText = await response.text();
			console.log(`[Download Model API] Backend error: ${response.status} ${errorText}`)

			return NextResponse.json({
				error: 'Backend Error',
				details: errorText,
				status: response.status,
				url: backendUrl
			},
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log(`[Download Model API] Backend:`)

		return NextResponse.json(data);

	} catch (error) {
		console.error(`[Download Model API] Fetch error:`, error);

		return NextResponse.json(
			{
				error: 'Failed to connect backend',
				details: error instanceof Error ? error.message : String(error),
				url: backendUrl
			},
			{ status: 500 }
		);
	}
}
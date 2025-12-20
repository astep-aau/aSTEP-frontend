import { NextResponse } from "next/server";

export async function GET() {
	const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
	const backendUrl = `${baseurl}/model-loss/`


	console.log(`[Model Loss API] Fetching from backend: ${backendUrl}`)
	try {
		const response = await fetch(backendUrl)
		console.log(`[Model Loss API]: Backend response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[Model Loss API] Backend error: ${response.status} ${errorText}`);

			return NextResponse.json(
				{
					error: 'Backend Error',
					details: errorText,
					status: response.status,
					url: backendUrl
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log(`[Model Loss API]: Backend data:`)

		return NextResponse.json(data);

	} catch (error) {
		console.error(`[Model Loss API]: Fetch error:`, error);

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
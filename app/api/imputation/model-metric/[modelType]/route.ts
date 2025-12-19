import {
	NextRequest,
	NextResponse
} from 'next/server';
import { ModelMetrics, ModelType } from '@/app/group6/services/imputation';


export async function GET(
_request: NextRequest,
{ params }: { params: Promise<{ modelType: string}> }
) {

		const { modelType } = await params;

		if (!modelType) {
			return NextResponse.json(
				{ error: `Missing required parameter: ${modelType}` },
				{ status: 400 }
			);
		}

		const USE_MOCKS = process.env.USE_MOCKS === 'true';

		if (USE_MOCKS) {
			const { getMockModelMetrics } = await import(
				'@/app/group6/services'
			);

			// Pass modelType parameter to mock function
			const data = getMockModelMetrics(modelType);

			await new Promise(resolve => setTimeout(resolve, 500));

			if (data) {
				return NextResponse.json(data);
			}

			return NextResponse.json(
				{ error: `Mocked model metrics not found for type: ${modelType}` },
				{ status: 404 });
		}

		const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
		const response = await fetch(
			`${baseurl}/model-metrics/${modelType}/`
		);

		if (!response.ok) {
			console.error(`Backend error: ${response.status} ${response.statusText}`);
			return NextResponse.json(
				{ error: `Backend API error: ${response.statusText}` },
				{ status: response.status }
			);
		}

		const data: ModelMetrics[] = await response.json();
		console.log('Backend data:', JSON.stringify(data, null, 2));

		return NextResponse.json(data);
	}
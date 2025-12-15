import { 
    NextResponse 
} from 'next/server';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ params: string[] }> }
) {
    try {
        const urlParams = await params;
        const [modelType] = urlParams.params;

        const USE_MOCKS = process.env.USE_MOCKS === 'true';

        if (USE_MOCKS) {
            const { getMockModelMetrics } = await import(
                '@/app/group6/services'
            );
            const data = getMockModelMetrics();

            await new Promise(resolve => setTimeout(resolve, 500));

            if (data) {
                return NextResponse.json(data);
            }

            return NextResponse.json(
                { error: 'Mocked model metrics not found' },
                { status: 501 });
        }

        const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
        const response = await fetch(
            `${baseurl}/model-metric/${modelType}`
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Backend Error' },
                { status: 500 });
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch model metrics' },
            { status: 500 });
    }
}
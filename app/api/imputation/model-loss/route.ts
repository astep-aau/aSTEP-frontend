import { 
    NextResponse 
} from "next/server";

export async function GET() {
    try {
        const USE_MOCKS = process.env.USE_MOCKS === 'true';

        if (USE_MOCKS) {
            const { getMockModelLosses } = await import(
                '@/app/group6/services'
            );
            const data = getMockModelLosses();

            await new Promise(resolve => setTimeout(resolve, 500));

            if (data) {
                return NextResponse.json(data);
            }

            return NextResponse.json(
                { error: 'Mocked model losses not found' },
                { status: 501 });
        }


        const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
        const response = await fetch(`
            ${baseurl}/model-loss/`
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
            { error: 'Failed to fetch model losses' },
            { status: 500 });
    }
}
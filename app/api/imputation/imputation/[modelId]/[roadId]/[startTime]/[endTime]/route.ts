import { 
    NextResponse 
} from "next/server";

export async function GET( modelId: string, roadId: string, startTime: string, endTime: string ){
    try {
        const USE_MOCKS = process.env.USE_MOCKS === 'true';

        if (USE_MOCKS) {
            const { getMockImputationResults } = await import('@/app/group6/services');
            const data = getMockImputationResults(modelId, roadId, Number(startTime), Number(endTime));
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            if (data) {
                return NextResponse.json(data);
            }

            return NextResponse.json({ error: 'Mocked imputation data not found' }, { status: 501 });
        }
        else {
            const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
            const apiPrefix = process.env.GROUP6_API_PREFIX || 'api/imputation';
            
            const response = await fetch(`${baseurl}/${apiPrefix}/imputation/impute-result/${modelId}/${roadId}/${startTime}/${endTime}/`);

            if (!response.ok) {
                return NextResponse.json({ error: 'Backend Error' }, { status: 500 });
            }
            const data = await response.json();
            
            return NextResponse.json(data);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch imputation results' }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { TimeInterval } from "@/app/group6/services/imputation";

export async function GET(
    _request: Request,
    { 
			params 
		}: { params: Promise<{ params: string[] }> }
){
    try {
        const urlParams = await params;
        const [modelId, roadId] = urlParams.params;

        const USE_MOCKS = process.env.USE_MOCKS === 'true';
        if (USE_MOCKS) {
            const { getMockTimeIntervalSingle } = await import(
                '@/app/group6/services'
            );
            // Returns single TimeInterval (not array)
            const data = getMockTimeIntervalSingle();
            await new Promise(resolve => setTimeout(resolve, 500));

            if (data) {
                return NextResponse.json(data);
            }
            return NextResponse.json(
                { error: 'Mocked time interval not found' },
                { status: 501 });
        }
        
        const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
        // Forward to backend impute-result time-interval endpoint
        if (!modelId || !roadId) {
            return NextResponse.json(
                { error: 'Missing modelId or roadId' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${baseurl}/impute-result/time-interval/${modelId}/${roadId}/`
        );

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { error: text || 'Backend Error' }, 
                { status: 500 });
        }
        const data: TimeInterval[]  = await response.json();
        return NextResponse.json(data);

} catch (error) {
    console.error('GET /api/imputation/time-interval failed:', error);
    return NextResponse.json(
        { error: String(error) },
        { status: 500 }
    );
}
}
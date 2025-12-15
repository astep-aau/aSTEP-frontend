import {
    NextResponse 
} from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ modelId: string }> }
){
    try {
        const urlParams = await params;
        const modelId = urlParams.modelId;

        const USE_MOCKS = process.env.USE_MOCKS === 'true';

        if (USE_MOCKS) {
            const { getTestModelDownload } = await import(
                '@/app/group6/__tests__/'
            );
            const data = getTestModelDownload(modelId);

            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            if (data) {
                return NextResponse.json(data);
            }
            return NextResponse.json(
                { error: 'Mocked exported model not found' }, 
                { status: 501 });
        } 

        const baseurl = process.env.GROUP6_URL || 'http://localhost:8000';
        const response = await fetch(
            `${baseurl}/download-model/${modelId}/`
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
            { error: 'Failed to export model' }, 
            { status: 500 });
    }
}
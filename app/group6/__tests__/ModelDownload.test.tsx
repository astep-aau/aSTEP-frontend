export function getTestModelDownload(modelId: string) {
    const fileContent = `This is a mock model file for model ID: ${modelId}\nGenerated for testing purposes.`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    return blob;
}
import { 
    fetchDownloadModel 
} from "../services/imputation/imputation.api";

/**
 * @description Hook to download a model file given its ID.
 * @param modelId - ID of the model to download
 * @returns void
 */

export async function useDownloadModel(modelId: string) {

    const blob = await fetchDownloadModel(modelId);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modelId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
import { apiClient } from "@/lib/api/client";
import type { ImportPreviewResponse, ConfirmTestCaseImportRequest, ImportConfirmResponse } from "./import.types";

const BASE_PATH = "/api/v1";

export const previewImport = async (datasetId: string, file: File): Promise<ImportPreviewResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const { data } = await apiClient.post<ImportPreviewResponse>(
    `${BASE_PATH}/datasets/${datasetId}/test-cases/import/preview`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return data;
};

export const confirmImport = async (datasetId: string, request: ConfirmTestCaseImportRequest): Promise<ImportConfirmResponse> => {
  const { data } = await apiClient.post<ImportConfirmResponse>(
    `${BASE_PATH}/datasets/${datasetId}/test-cases/import/confirm`,
    request
  );
  return data;
};

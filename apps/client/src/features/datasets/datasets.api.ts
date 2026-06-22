import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/api/types";
import type { DatasetResponse, DatasetCreateRequest, DatasetUpdateRequest } from "./datasets.types";

const BASE_PATH = "/api/v1/projects";

type PageParams = { page?: number; size?: number; search?: string };

export const datasetKeys = {
  all: ["datasets"] as const,
  lists: () => [...datasetKeys.all, "list"] as const,
  list: (projectId: string, params?: PageParams) => [...datasetKeys.lists(), projectId, params] as const,
  details: () => [...datasetKeys.all, "detail"] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
};

export const fetchDatasets = async (projectId: string, params?: PageParams): Promise<PageResponse<DatasetResponse>> => {
  const { data } = await apiClient.get<PageResponse<DatasetResponse>>(`${BASE_PATH}/${projectId}/datasets`, { params });
  return data;
};

export const fetchDataset = async (projectId: string, id: string): Promise<DatasetResponse> => {
  const { data } = await apiClient.get<DatasetResponse>(`${BASE_PATH}/${projectId}/datasets/${id}`);
  return data;
};

export const createDataset = async (request: DatasetCreateRequest): Promise<DatasetResponse> => {
  const { projectId, ...payload } = request;
  const { data } = await apiClient.post<DatasetResponse>(`${BASE_PATH}/${projectId}/datasets`, payload);
  return data;
};

export const updateDataset = async (projectId: string, id: string, request: DatasetUpdateRequest): Promise<DatasetResponse> => {
  const { data } = await apiClient.put<DatasetResponse>(`${BASE_PATH}/${projectId}/datasets/${id}`, request);
  return data;
};

export const deleteDataset = async (projectId: string, id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/${projectId}/datasets/${id}`);
};

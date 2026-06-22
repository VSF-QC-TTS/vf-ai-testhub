import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/api/types";
import type { RunComparisonResponse } from "../runs/runs.types";
import type { ExperimentResponse, CreateExperimentRequest, ExperimentFilterParams } from "./experiments.types";

const BASE_PATH = "/api/v1";

export const experimentKeys = {
  all: ["experiments"] as const,
  lists: () => [...experimentKeys.all, "list"] as const,
  list: (projectId: string, params?: ExperimentFilterParams) => [...experimentKeys.lists(), projectId, params] as const,
  details: () => [...experimentKeys.all, "detail"] as const,
  detail: (id: string) => [...experimentKeys.details(), id] as const,
  comparison: (id: string) => [...experimentKeys.details(), id, "comparison"] as const,
};

export const fetchExperiments = async (projectId: string, params?: ExperimentFilterParams): Promise<PageResponse<ExperimentResponse>> => {
  const { data } = await apiClient.get<PageResponse<ExperimentResponse>>(`${BASE_PATH}/projects/${projectId}/experiments`, { params });
  return data;
};

export const fetchExperiment = async (experimentId: string): Promise<ExperimentResponse> => {
  const { data } = await apiClient.get<ExperimentResponse>(`${BASE_PATH}/experiments/${experimentId}`);
  return data;
};

export const createExperiment = async (projectId: string, request: CreateExperimentRequest): Promise<ExperimentResponse> => {
  const { data } = await apiClient.post<ExperimentResponse>(`${BASE_PATH}/projects/${projectId}/experiments`, request);
  return data;
};

export const startExperiment = async (experimentId: string): Promise<ExperimentResponse> => {
  const { data } = await apiClient.post<ExperimentResponse>(`${BASE_PATH}/experiments/${experimentId}/start`);
  return data;
};

export const fetchExperimentComparison = async (experimentId: string): Promise<RunComparisonResponse> => {
  const { data } = await apiClient.get<RunComparisonResponse>(`${BASE_PATH}/experiments/${experimentId}/comparison`);
  return data;
};

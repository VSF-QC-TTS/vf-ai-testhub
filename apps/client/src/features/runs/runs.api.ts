import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/api/types";
import type { RunSnapshotDto, TriggerRunRequest, RunFilterParams, RunComparisonResponse } from "./runs.types";

const BASE_PATH = "/api/v1";

export const runKeys = {
  all: ["runs"] as const,
  lists: () => [...runKeys.all, "list"] as const,
  list: (datasetId: string, params?: RunFilterParams) => [...runKeys.lists(), datasetId, params] as const,
  details: () => [...runKeys.all, "detail"] as const,
  detail: (id: string) => [...runKeys.details(), id] as const,
  compare: (baseId: string, candidateId: string) => [...runKeys.all, "compare", baseId, candidateId] as const,
};

export const fetchRuns = async (datasetId: string, params?: RunFilterParams): Promise<PageResponse<RunSnapshotDto>> => {
  const { data } = await apiClient.get<PageResponse<RunSnapshotDto>>(`${BASE_PATH}/datasets/${datasetId}/runs`, { params });
  return data;
};

export const fetchRun = async (runId: string): Promise<RunSnapshotDto> => {
  const { data } = await apiClient.get<RunSnapshotDto>(`${BASE_PATH}/runs/${runId}`);
  return data;
};

export const triggerRun = async (datasetId: string, request: TriggerRunRequest): Promise<RunSnapshotDto> => {
  const { data } = await apiClient.post<RunSnapshotDto>(`${BASE_PATH}/datasets/${datasetId}/runs`, request);
  return data;
};

export const compareRuns = async (baseRunId: string, candidateRunId: string): Promise<RunComparisonResponse> => {
  const { data } = await apiClient.get<RunComparisonResponse>(`${BASE_PATH}/runs/compare`, {
    params: { baseRunId, candidateRunId }
  });
  return data;
};

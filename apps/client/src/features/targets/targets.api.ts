import { apiClient } from "../../lib/api/client";
import type { PageResponse, UUID } from "../../lib/api/types";
import type { TargetRequest, TargetResponse, TargetTestResponse } from "./targets.types";

export const targetsApi = {
  create: async (data: TargetRequest): Promise<TargetResponse> => {
    const res = await apiClient.post<TargetResponse>(`/api/v1/projects/${data.projectId}/targets`, data);
    return res.data;
  },

  update: async (id: UUID, data: TargetRequest): Promise<TargetResponse> => {
    const res = await apiClient.put<TargetResponse>(`/api/v1/targets/${id}`, data);
    return res.data;
  },

  getById: async (id: UUID): Promise<TargetResponse> => {
    const res = await apiClient.get<TargetResponse>(`/api/v1/targets/${id}`);
    return res.data;
  },

  listByProject: async (projectId: UUID, params?: { page?: number; size?: number }): Promise<PageResponse<TargetResponse>> => {
    const res = await apiClient.get<PageResponse<TargetResponse>>(`/api/v1/projects/${projectId}/targets`, { params });
    return res.data;
  },

  delete: async (id: UUID): Promise<void> => {
    await apiClient.delete(`/api/v1/targets/${id}`);
  },

  parseCurl: async (projectId: UUID, curlCommand: string): Promise<Partial<TargetRequest>> => {
    const res = await apiClient.post<Partial<TargetRequest>>(`/api/v1/projects/${projectId}/targets/parse-curl`, { curlCommand });
    return res.data;
  },

  testConnection: async (projectId: UUID, data: TargetRequest): Promise<TargetTestResponse> => {
    const res = await apiClient.post<TargetTestResponse>(`/api/v1/projects/${projectId}/targets/test-connection`, data);
    return res.data;
  }
};

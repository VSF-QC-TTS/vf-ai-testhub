import { apiClient } from "../../lib/api/client";
import type { PageResponse, UUID } from "../../lib/api/types";
import type { ProjectRequest, ProjectResponse } from "./projects.types";

export const projectsApi = {
  create: async (data: ProjectRequest): Promise<ProjectResponse> => {
    const res = await apiClient.post<ProjectResponse>("/api/v1/projects", data);
    return res.data;
  },

  update: async (id: UUID, data: ProjectRequest): Promise<ProjectResponse> => {
    const res = await apiClient.put<ProjectResponse>(`/api/v1/projects/${id}`, data);
    return res.data;
  },

  getById: async (id: UUID): Promise<ProjectResponse> => {
    const res = await apiClient.get<ProjectResponse>(`/api/v1/projects/${id}`);
    return res.data;
  },

  list: async (params?: { page?: number; size?: number }): Promise<PageResponse<ProjectResponse>> => {
    const res = await apiClient.get<PageResponse<ProjectResponse>>("/api/v1/projects", { params });
    return res.data;
  },

  archive: async (id: UUID): Promise<void> => {
    await apiClient.patch(`/api/v1/projects/${id}/archive`);
  },
};

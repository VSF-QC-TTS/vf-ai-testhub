import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/api/types";
import type { ToolExpectationResponse, ToolExpectationCreateRequest, ToolExpectationUpdateRequest } from "./toolExpectations.types";

const BASE_PATH = "/api/v1";

type PageParams = { page?: number; size?: number };

export const toolExpectationKeys = {
  all: ["toolExpectations"] as const,
  lists: () => [...toolExpectationKeys.all, "list"] as const,
  list: (testCaseId: string, params?: PageParams) => [...toolExpectationKeys.lists(), testCaseId, params] as const,
  details: () => [...toolExpectationKeys.all, "detail"] as const,
  detail: (id: string) => [...toolExpectationKeys.details(), id] as const,
};

export const fetchToolExpectations = async (testCaseId: string, params?: PageParams): Promise<PageResponse<ToolExpectationResponse>> => {
  const { data } = await apiClient.get<PageResponse<ToolExpectationResponse>>(`${BASE_PATH}/test-cases/${testCaseId}/tool-expectations`, { params });
  return data;
};

export const fetchToolExpectation = async (id: string): Promise<ToolExpectationResponse> => {
  const { data } = await apiClient.get<ToolExpectationResponse>(`${BASE_PATH}/tool-expectations/${id}`);
  return data;
};

export const createToolExpectation = async (testCaseId: string, request: ToolExpectationCreateRequest): Promise<ToolExpectationResponse> => {
  const { data } = await apiClient.post<ToolExpectationResponse>(`${BASE_PATH}/test-cases/${testCaseId}/tool-expectations`, request);
  return data;
};

export const updateToolExpectation = async (id: string, request: ToolExpectationUpdateRequest): Promise<ToolExpectationResponse> => {
  const { data } = await apiClient.put<ToolExpectationResponse>(`${BASE_PATH}/tool-expectations/${id}`, request);
  return data;
};

export const deleteToolExpectation = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/tool-expectations/${id}`);
};

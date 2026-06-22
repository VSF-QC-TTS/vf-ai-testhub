import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/api/types";
import type { AssertionResponse, AssertionCreateRequest, AssertionUpdateRequest } from "./assertions.types";

const BASE_PATH = "/api/v1";

type PageParams = { page?: number; size?: number };

export const assertionKeys = {
  all: ["assertions"] as const,
  lists: () => [...assertionKeys.all, "list"] as const,
  list: (testCaseId: string, params?: PageParams) => [...assertionKeys.lists(), testCaseId, params] as const,
  details: () => [...assertionKeys.all, "detail"] as const,
  detail: (id: string) => [...assertionKeys.details(), id] as const,
};

export const fetchAssertions = async (testCaseId: string, params?: PageParams): Promise<PageResponse<AssertionResponse>> => {
  const { data } = await apiClient.get<PageResponse<AssertionResponse>>(`${BASE_PATH}/test-cases/${testCaseId}/assertions`, { params });
  return data;
};

export const fetchAssertion = async (id: string): Promise<AssertionResponse> => {
  const { data } = await apiClient.get<AssertionResponse>(`${BASE_PATH}/assertions/${id}`);
  return data;
};

export const createAssertion = async (testCaseId: string, request: AssertionCreateRequest): Promise<AssertionResponse> => {
  const { data } = await apiClient.post<AssertionResponse>(`${BASE_PATH}/test-cases/${testCaseId}/assertions`, request);
  return data;
};

export const updateAssertion = async (id: string, request: AssertionUpdateRequest): Promise<AssertionResponse> => {
  const { data } = await apiClient.put<AssertionResponse>(`${BASE_PATH}/assertions/${id}`, request);
  return data;
};

export const deleteAssertion = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/assertions/${id}`);
};

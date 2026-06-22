import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/lib/api/types";
import type { TestCaseResponse, TestCaseFilterParams, TestCaseCreateRequest, TestCaseUpdateRequest } from "./testcases.types";

const BASE_PATH = "/api/v1";

export const testCaseKeys = {
  all: ["testcases"] as const,
  lists: () => [...testCaseKeys.all, "list"] as const,
  list: (datasetId: string, params?: TestCaseFilterParams) => [...testCaseKeys.lists(), datasetId, params] as const,
  details: () => [...testCaseKeys.all, "detail"] as const,
  detail: (id: string) => [...testCaseKeys.details(), id] as const,
};

export const fetchTestCases = async (datasetId: string, params?: TestCaseFilterParams): Promise<PageResponse<TestCaseResponse>> => {
  const { data } = await apiClient.get<PageResponse<TestCaseResponse>>(`${BASE_PATH}/datasets/${datasetId}/test-cases`, { params });
  return data;
};

export const fetchTestCase = async (id: string): Promise<TestCaseResponse> => {
  const { data } = await apiClient.get<TestCaseResponse>(`${BASE_PATH}/test-cases/${id}`);
  return data;
};

// Create, Update, Delete will be added in Task 5.3

export const createTestCase = async (datasetId: string, request: TestCaseCreateRequest): Promise<TestCaseResponse> => {
  const { data } = await apiClient.post<TestCaseResponse>(`${BASE_PATH}/datasets/${datasetId}/test-cases`, request);
  return data;
};

export const updateTestCase = async (id: string, request: TestCaseUpdateRequest): Promise<TestCaseResponse> => {
  const { data } = await apiClient.put<TestCaseResponse>(`${BASE_PATH}/test-cases/${id}`, request);
  return data;
};

export const deleteTestCase = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/test-cases/${id}`);
};

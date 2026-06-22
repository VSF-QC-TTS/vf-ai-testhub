import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testCaseKeys, fetchTestCases, fetchTestCase } from "./testcases.api";
import type { TestCaseFilterParams } from "./testcases.types";

export const useTestCases = (datasetId: string, params?: TestCaseFilterParams) => {
  return useQuery({
    queryKey: testCaseKeys.list(datasetId, params),
    queryFn: () => fetchTestCases(datasetId, params),
    enabled: !!datasetId,
  });
};

export const useTestCase = (id: string) => {
  return useQuery({
    queryKey: testCaseKeys.detail(id),
    queryFn: () => fetchTestCase(id),
    enabled: !!id,
  });
};

import { createTestCase, updateTestCase, deleteTestCase } from "./testcases.api";
import type { TestCaseCreateRequest, TestCaseUpdateRequest } from "./testcases.types";

export const useCreateTestCase = (datasetId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TestCaseCreateRequest) => createTestCase(datasetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testCaseKeys.lists() });
    },
  });
};

export const useUpdateTestCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestCaseUpdateRequest }) => updateTestCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: testCaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testCaseKeys.lists() });
    },
  });
};

export const useDeleteTestCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteTestCase(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: testCaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testCaseKeys.lists() });
    },
  });
};

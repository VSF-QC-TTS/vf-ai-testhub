import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assertionKeys, fetchAssertions, fetchAssertion, createAssertion, updateAssertion, deleteAssertion } from "./assertions.api";
import type { AssertionCreateRequest, AssertionUpdateRequest } from "./assertions.types";

type PageParams = { page?: number; size?: number };

export const useAssertions = (testCaseId: string, params?: PageParams) => {
  return useQuery({
    queryKey: assertionKeys.list(testCaseId, params),
    queryFn: () => fetchAssertions(testCaseId, params),
    enabled: !!testCaseId,
  });
};

export const useAssertion = (id: string) => {
  return useQuery({
    queryKey: assertionKeys.detail(id),
    queryFn: () => fetchAssertion(id),
    enabled: !!id,
  });
};

export const useCreateAssertion = (testCaseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AssertionCreateRequest) => createAssertion(testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assertionKeys.lists() });
    },
  });
};

export const useUpdateAssertion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssertionUpdateRequest }) => updateAssertion(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assertionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assertionKeys.lists() });
    },
  });
};

export const useDeleteAssertion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteAssertion(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: assertionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assertionKeys.lists() });
    },
  });
};

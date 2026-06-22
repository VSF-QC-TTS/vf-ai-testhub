import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toolExpectationKeys, fetchToolExpectations, fetchToolExpectation, createToolExpectation, updateToolExpectation, deleteToolExpectation } from "./toolExpectations.api";
import type { ToolExpectationCreateRequest, ToolExpectationUpdateRequest } from "./toolExpectations.types";

type PageParams = { page?: number; size?: number };

export const useToolExpectations = (testCaseId: string, params?: PageParams) => {
  return useQuery({
    queryKey: toolExpectationKeys.list(testCaseId, params),
    queryFn: () => fetchToolExpectations(testCaseId, params),
    enabled: !!testCaseId,
  });
};

export const useToolExpectation = (id: string) => {
  return useQuery({
    queryKey: toolExpectationKeys.detail(id),
    queryFn: () => fetchToolExpectation(id),
    enabled: !!id,
  });
};

export const useCreateToolExpectation = (testCaseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ToolExpectationCreateRequest) => createToolExpectation(testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toolExpectationKeys.lists() });
    },
  });
};

export const useUpdateToolExpectation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToolExpectationUpdateRequest }) => updateToolExpectation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: toolExpectationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: toolExpectationKeys.lists() });
    },
  });
};

export const useDeleteToolExpectation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteToolExpectation(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: toolExpectationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: toolExpectationKeys.lists() });
    },
  });
};

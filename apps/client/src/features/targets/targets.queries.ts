import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { targetsApi } from "./targets.api";
import type { TargetRequest } from "./targets.types";
import type { UUID } from "../../lib/api/types";

export const targetKeys = {
  all: ["targets"] as const,
  lists: () => [...targetKeys.all, "list"] as const,
  list: (projectId: UUID, filters: { page?: number; size?: number }) => [...targetKeys.lists(), projectId, filters] as const,
  details: () => [...targetKeys.all, "detail"] as const,
  detail: (id: UUID) => [...targetKeys.details(), id] as const,
};

export function useTargets(projectId: UUID | null, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: targetKeys.list(projectId!, params || {}),
    queryFn: () => targetsApi.listByProject(projectId!, params),
    enabled: !!projectId,
  });
}

export function useTarget(id: UUID) {
  return useQuery({
    queryKey: targetKeys.detail(id),
    queryFn: () => targetsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: targetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
  });
}

export function useUpdateTarget(id: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TargetRequest) => targetsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
      queryClient.setQueryData(targetKeys.detail(id), updated);
    },
  });
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: targetsApi.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
      queryClient.removeQueries({ queryKey: targetKeys.detail(id) });
    },
  });
}

export function useParseCurl(projectId: UUID | null) {
  return useMutation({
    mutationFn: (curlCommand: string) => targetsApi.parseCurl(projectId!, curlCommand),
  });
}

export function useTestConnectionTarget(projectId: UUID | null) {
  return useMutation({
    mutationFn: (data: TargetRequest) => targetsApi.testConnection(projectId!, data),
  });
}

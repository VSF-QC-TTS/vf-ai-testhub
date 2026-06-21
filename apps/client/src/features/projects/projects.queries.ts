import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./projects.api";
import type { ProjectRequest } from "./projects.types";
import type { UUID } from "../../lib/api/types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: { page?: number; size?: number; search?: string }) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: UUID) => [...projectKeys.details(), id] as const,
};

export function useProjects(params?: { page?: number; size?: number; search?: string }) {
  return useQuery({
    queryKey: projectKeys.list(params || {}),
    queryFn: () => projectsApi.list(params),
  });
}

export function useProject(id: UUID) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject(id: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectRequest) => projectsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(id), updated);
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.archive,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

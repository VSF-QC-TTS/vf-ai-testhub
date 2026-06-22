import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  datasetKeys,
  fetchDatasets,
  fetchDataset,
  createDataset,
  updateDataset,
  deleteDataset
} from "./datasets.api";
import type { DatasetCreateRequest, DatasetUpdateRequest } from "./datasets.types";

type PageParams = { page?: number; size?: number; search?: string };

export function useDatasets(projectId: string, params?: PageParams) {
  return useQuery({
    queryKey: datasetKeys.list(projectId, params),
    queryFn: () => fetchDatasets(projectId, params),
    enabled: !!projectId,
  });
}

export function useDataset(projectId: string, id: string) {
  return useQuery({
    queryKey: datasetKeys.detail(id),
    queryFn: () => fetchDataset(projectId, id),
    enabled: !!projectId && !!id,
  });
}

export function useCreateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DatasetCreateRequest) => createDataset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
    },
  });
}

export function useUpdateDataset(projectId: string, id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DatasetUpdateRequest) => updateDataset(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
    },
  });
}

export function useDeleteDataset(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteDataset(projectId, id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: datasetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
    },
  });
}

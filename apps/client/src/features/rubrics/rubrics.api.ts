import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  RubricSnapshotDto,
  RubricPageResponse,
  CreateRubricDto,
  UpdateRubricDto,
  RubricFilterParams
} from './rubrics.schemas';

const BASE_PATH = '/api/v1';

export const rubricsKeys = {
  all: ['rubrics'] as const,
  projectList: (projectId: string, params?: RubricFilterParams) => [...rubricsKeys.all, 'project', projectId, params] as const,
  globalList: (params?: RubricFilterParams) => [...rubricsKeys.all, 'global', params] as const,
  detail: (id: string) => [...rubricsKeys.all, 'detail', id] as const,
};

export const fetchProjectRubrics = async (projectId: string, params?: RubricFilterParams) => {
  const { data } = await apiClient.get<RubricPageResponse>(`${BASE_PATH}/projects/${projectId}/rubrics`, { params });
  return data;
};

export const fetchGlobalRubrics = async (params?: RubricFilterParams) => {
  const { data } = await apiClient.get<RubricPageResponse>(`${BASE_PATH}/rubrics/global`, { params });
  return data;
};

export const fetchRubric = async (rubricId: string) => {
  const { data } = await apiClient.get<RubricSnapshotDto>(`${BASE_PATH}/rubrics/${rubricId}`);
  return data;
};

export const createRubric = async (params: { projectId: string; body: CreateRubricDto }) => {
  const { data } = await apiClient.post<RubricSnapshotDto>(`${BASE_PATH}/projects/${params.projectId}/rubrics`, params.body);
  return data;
};

export const updateRubric = async (params: { rubricId: string; body: UpdateRubricDto }) => {
  const { data } = await apiClient.put<RubricSnapshotDto>(`${BASE_PATH}/rubrics/${params.rubricId}`, params.body);
  return data;
};

export const archiveRubric = async (rubricId: string) => {
  await apiClient.delete<void>(`${BASE_PATH}/rubrics/${rubricId}`);
};

// React Query Hooks

export const useProjectRubrics = (projectId: string, params?: RubricFilterParams) => {
  return useQuery({
    queryKey: rubricsKeys.projectList(projectId, params),
    queryFn: () => fetchProjectRubrics(projectId, params),
    enabled: !!projectId,
  });
};

export const useGlobalRubrics = (params?: RubricFilterParams) => {
  return useQuery({
    queryKey: rubricsKeys.globalList(params),
    queryFn: () => fetchGlobalRubrics(params),
  });
};

export const useRubric = (rubricId: string) => {
  return useQuery({
    queryKey: rubricsKeys.detail(rubricId),
    queryFn: () => fetchRubric(rubricId),
    enabled: !!rubricId,
  });
};

export const useCreateRubric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRubric,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rubricsKeys.projectList(variables.projectId) });
    },
  });
};

export const useUpdateRubric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRubric,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rubricsKeys.detail(data.publicId) });
      queryClient.invalidateQueries({ queryKey: rubricsKeys.all });
    },
  });
};

export const useArchiveRubric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveRubric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rubricsKeys.all });
    },
  });
};

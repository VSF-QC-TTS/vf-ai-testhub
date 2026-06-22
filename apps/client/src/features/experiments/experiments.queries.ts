import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { experimentKeys, fetchExperiments, fetchExperiment, createExperiment, startExperiment, fetchExperimentComparison } from "./experiments.api";
import type { CreateExperimentRequest, ExperimentFilterParams } from "./experiments.types";

export const useExperiments = (projectId: string, params?: ExperimentFilterParams) => {
  return useQuery({
    queryKey: experimentKeys.list(projectId, params),
    queryFn: () => fetchExperiments(projectId, params),
    enabled: !!projectId,
  });
};

export const useExperiment = (experimentId: string) => {
  return useQuery({
    queryKey: experimentKeys.detail(experimentId),
    queryFn: () => fetchExperiment(experimentId),
    enabled: !!experimentId,
  });
};

export const useExperimentPolling = (experimentId: string) => {
  return useQuery({
    queryKey: experimentKeys.detail(experimentId),
    queryFn: () => fetchExperiment(experimentId),
    enabled: !!experimentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const isTerminal = status === "COMPLETED" || status === "FAILED" || status === "CANCELLED";
      if (isTerminal) return false;
      return 3000;
    },
  });
};

export const useCreateExperiment = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateExperimentRequest) => createExperiment(projectId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(experimentKeys.detail(data.publicId), data);
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() });
    },
  });
};

export const useStartExperiment = (experimentId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => startExperiment(experimentId),
    onSuccess: (data) => {
      queryClient.setQueryData(experimentKeys.detail(data.publicId), data);
      queryClient.invalidateQueries({ queryKey: experimentKeys.lists() });
    },
  });
};

export const useExperimentComparison = (experimentId?: string | null) => {
  return useQuery({
    queryKey: experimentKeys.comparison(experimentId!),
    queryFn: () => fetchExperimentComparison(experimentId!),
    enabled: !!experimentId,
  });
};

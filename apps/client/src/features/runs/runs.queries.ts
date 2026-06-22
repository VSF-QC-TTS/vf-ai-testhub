import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { runKeys, fetchRuns, fetchRun, triggerRun } from "./runs.api";
import type { TriggerRunRequest, RunFilterParams } from "./runs.types";
import type { RunStatus } from "@/lib/api/types";

export const useRuns = (datasetId: string, params?: RunFilterParams) => {
  return useQuery({
    queryKey: runKeys.list(datasetId, params),
    queryFn: () => fetchRuns(datasetId, params),
    enabled: !!datasetId,
  });
};

export const useRun = (runId: string) => {
  return useQuery({
    queryKey: runKeys.detail(runId),
    queryFn: () => fetchRun(runId),
    enabled: !!runId,
  });
};

export const useRunPolling = (runId: string, status?: RunStatus) => {
  const isTerminal = status === "COMPLETED" || status === "FAILED" || status === "CANCELLED";
  return useQuery({
    queryKey: runKeys.detail(runId),
    queryFn: () => fetchRun(runId),
    enabled: !!runId && !isTerminal,
    refetchInterval: isTerminal ? false : 3000,
  });
};

export const useTriggerRun = (datasetId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TriggerRunRequest) => triggerRun(datasetId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(runKeys.detail(data.publicId), data);
      queryClient.invalidateQueries({ queryKey: runKeys.lists() });
    },
  });
};

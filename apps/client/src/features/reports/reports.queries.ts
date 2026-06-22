import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from './reports.api';
import type { ManualReviewBatchRequest } from './reports.types';

export const reportKeys = {
  all: ['reports'] as const,
  runReport: (runId: string) => [...reportKeys.all, runId, 'summary'] as const,
  runResults: (runId: string) => [...reportKeys.all, runId, 'results'] as const,
};

export function useRunReport(runId: string) {
  return useQuery({
    queryKey: reportKeys.runReport(runId),
    queryFn: () => reportsApi.getRunReport(runId),
    enabled: !!runId,
  });
}

export function useRunResults(runId: string) {
  return useQuery({
    queryKey: reportKeys.runResults(runId),
    queryFn: () => reportsApi.getRunResults(runId),
    enabled: !!runId,
  });
}

export function useSubmitManualReview(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ManualReviewBatchRequest) => reportsApi.submitManualReview(runId, request),
    onSuccess: () => {
      // Invalidate both report summary and results to refresh the UI with new statuses
      queryClient.invalidateQueries({ queryKey: reportKeys.runReport(runId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.runResults(runId) });
    },
  });
}

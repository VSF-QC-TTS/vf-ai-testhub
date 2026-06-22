import { apiClient } from '../../lib/api/client';
import type { 
  RunReportResponse, 
  TestResultReportItem, 
  ManualReviewBatchRequest, 
  ManualReviewBatchResponse 
} from './reports.types';

export const reportsApi = {
  getRunReport: async (runId: string): Promise<RunReportResponse> => {
    const { data } = await apiClient.get<RunReportResponse>(`/api/v1/runs/${runId}/report`);
    return data;
  },

  getRunResults: async (runId: string): Promise<TestResultReportItem[]> => {
    const { data } = await apiClient.get<TestResultReportItem[]>(`/api/v1/runs/${runId}/results`);
    return data;
  },

  submitManualReview: async (runId: string, request: ManualReviewBatchRequest): Promise<ManualReviewBatchResponse> => {
    const { data } = await apiClient.post<ManualReviewBatchResponse>(`/api/v1/runs/${runId}/review`, request);
    return data;
  }
};

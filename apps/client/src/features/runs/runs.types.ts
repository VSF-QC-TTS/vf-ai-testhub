import type { ReviewStatus, RunStatus } from "@/lib/api/types";

export type RunMode = "FULL_DATASET" | "SELECTED_SECTION" | "SELECTED_CASES";

export interface TriggerRunRequest {
  targetId: string;
  runMode: RunMode;
  sectionName?: string;
  testCaseIds?: string[];
  includeLlmJudge: boolean;
  includeToolExpectations: boolean;
  maxConcurrency: number;
  timeoutMs: number;
  retryCount: number;
  configVersionId?: string;
  promptVersionId?: string;
}

export interface RunSnapshotCaseDto {
  testCasePublicId: string;
  externalId?: string;
  input: string;
  status: ReviewStatus;
  latencyMs?: number;
  failureReason?: string;
  runResultId?: string;
}

export interface RunSnapshotDto {
  publicId: string;
  datasetPublicId: string;
  targetPublicId: string;
  status: RunStatus;
  runMode: RunMode;
  totalCases: number;
  completedCases: number;
  failedCases: number;
  uncertainCases: number;
  errorCases: number;
  skippedCases: number;
  elapsedMs?: number;
  currentPhase?: string;
  cases: RunSnapshotCaseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface RunFilterParams {
  status?: RunStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

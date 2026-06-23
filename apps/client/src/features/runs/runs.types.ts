import type { ReviewStatus, RunStatus } from "@/lib/api/types";

export type RunMode = "FULL_DATASET" | "SELECTED_SECTION" | "SELECTED_CASES" | "SAMPLE" | "FAILED_CASES";

export interface TriggerRunRequest {
  targetId: string;
  runMode: RunMode;
  selectedSection?: string;
  selectedCaseIds?: string[];
  includeLlmJudge: boolean;
  includeToolExpectations: boolean;
  maxConcurrency: number;
  timeoutMs: number;
  retryCount: number;
  previousRunId?: string;
}

export interface RunResponse {
  publicId: string;
  projectPublicId: string;
  datasetPublicId: string;
  targetPublicId: string;
  status: RunStatus;
  runMode: RunMode;
  includeLlmJudge: boolean;
  includeToolExpectations: boolean;
  maxConcurrency?: number;
  timeoutMs?: number;
  retryCount?: number;
  triggeredByPublicId?: string;
  previousRunPublicId?: string;
  selectedCaseIds?: string[];
  selectedSection?: string;
  startedAt?: string;
  finishedAt?: string;
  totalTestCases?: number;
  completedTestCases?: number;
  passedCount?: number;
  failedCount?: number;
  errorCount?: number;
  skippedCount?: number;
  llmRubricCount?: number;
  estimatedLlmCalls?: number;
  failureReason?: string;
  summary?: Record<string, unknown>;
  configSnapshot?: Record<string, unknown>;
  artifactPath?: string;
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

export type RunComparisonStatusShift = "REGRESSION" | "FIX" | "UNCHANGED" | "STATUS_CHANGED" | "NEW" | "MISSING";

export interface RunComparisonRunSummary {
  publicId: string;
  datasetPublicId: string;
  datasetName: string;
  targetPublicId: string;
  targetName: string;
  status: RunStatus;
  totalTestCases: number;
  completedTestCases: number;
  passedCount: number;
  failedCount: number;
  errorCount: number;
  skippedCount: number;
  startedAt?: string;
  finishedAt?: string;
}

export interface RunComparisonSummary {
  totalComparableCases: number;
  regressions: number;
  fixes: number;
  unchanged: number;
  statusChanged: number;
  newCases: number;
  missingCases: number;
  basePassRate?: number;
  candidatePassRate?: number;
  passRateDelta?: number;
  averageLatencyDeltaMs?: number;
}

export interface AssertionComparisonDiff {
  assertionPublicId: string;
  fieldPath?: string;
  expectedValue?: string;
  baseStatus: ReviewStatus;
  candidateStatus: ReviewStatus;
  baseActualValue?: string;
  candidateActualValue?: string;
  baseErrorMessage?: string;
  candidateErrorMessage?: string;
}

export interface ToolExpectationComparisonDiff {
  expectationPublicId: string;
  toolName?: string;
  agentName?: string;
  baseStatus: ReviewStatus;
  candidateStatus: ReviewStatus;
  baseErrorMessage?: string;
  candidateErrorMessage?: string;
}

export interface TestCaseComparisonDiff {
  testCasePublicId: string;
  externalId?: string;
  testCaseName?: string;
  testCaseInput?: string;
  sectionName?: string;
  baseStatus: ReviewStatus;
  candidateStatus: ReviewStatus;
  statusShift: RunComparisonStatusShift;
  baseScore?: number;
  candidateScore?: number;
  baseLatencyMs?: number;
  candidateLatencyMs?: number;
  latencyDeltaMs?: number;
  baseErrorMessage?: string;
  candidateErrorMessage?: string;
  assertionDiffs?: AssertionComparisonDiff[];
  toolExpectationDiffs?: ToolExpectationComparisonDiff[];
}

export interface RunComparisonResponse {
  baseRun: RunComparisonRunSummary;
  candidateRun: RunComparisonRunSummary;
  summary: RunComparisonSummary;
  diffs: TestCaseComparisonDiff[];
}

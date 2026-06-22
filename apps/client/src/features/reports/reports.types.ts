export type ReviewStatus = 'PASSED' | 'FAILED' | 'ERROR' | 'SKIPPED' | 'UNCERTAIN';

export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

export interface ManualReviewResponse {
  publicId: string;
  testResultPublicId: string;
  autoStatus: ReviewStatus;
  autoReason: string | null;
  reviewedStatus: ReviewStatus;
  reviewerNote: string | null;
  reviewedByPublicId: string | null;
  reviewedAt: string | null;
  finalStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssertionResultResponse {
  publicId: string;
  testResultPublicId: string;
  assertionPublicId: string;
  status: ReviewStatus;
  actualValue: unknown;
  expectedValue: unknown;
  reason: string | null;
  score: number | null;
  severity: SeverityLevel;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ToolExpectationResultResponse {
  publicId: string;
  testResultPublicId: string;
  toolExpectationPublicId: string;
  status: ReviewStatus;
  expectedToolName: string;
  actualToolCalls: unknown;
  actualAgent: string | null;
  actualSteps: unknown;
  reason: string | null;
  score: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface TestResultReportItem {
  publicId: string;
  testCasePublicId: string;
  testCaseName: string;
  testCaseInput: string | null;
  sectionName: string | null;
  autoStatus: ReviewStatus;
  finalStatus: ReviewStatus;
  score: number | null;
  requestSnapshot: Record<string, unknown> | null;
  rawResponse: Record<string, unknown> | null;
  responseSnapshot: Record<string, unknown> | null;
  extractedComponents: Record<string, unknown> | null;
  extractedToolCalls: unknown | null;
  latencyMs: number | null;
  errorMessage: string | null;
  manualReview: ManualReviewResponse | null;
  assertionResults: AssertionResultResponse[];
  toolExpectationResults: ToolExpectationResultResponse[];
  createdAt: string;
}

export interface RunReportResponse {
  runPublicId: string;
  total: number;
  passed: number;
  failed: number;
  error: number;
  skipped: number;
  uncertain: number;
  passRate: number;
  results: TestResultReportItem[];
}

export interface ManualReviewBatchItem {
  testResultId: string;
  reviewedStatus: ReviewStatus;
  reviewerNote: string | null;
}

export interface ManualReviewBatchRequest {
  reviews: ManualReviewBatchItem[];
}

export interface ManualReviewBatchResponse {
  runPublicId: string;
  reviewedCount: number;
  reviews: ManualReviewResponse[];
}

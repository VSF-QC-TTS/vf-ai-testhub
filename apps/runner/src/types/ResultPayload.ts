import type { ReviewStatus, SeverityLevel } from "./RunSnapshot.js";

export interface ResultIngestionRequest {
  readonly finalBatch: boolean;
  readonly testResults: readonly TestResultIngestionItem[];
}

export interface TestResultIngestionItem {
  readonly testCaseId: string;
  readonly status: ReviewStatus;
  readonly score?: number | null;
  readonly requestSnapshot?: Record<string, unknown>;
  readonly rawResponse?: Record<string, unknown>;
  readonly responseSnapshot?: Record<string, unknown>;
  readonly extractedComponents?: Record<string, unknown>;
  readonly extractedToolCalls?: unknown;
  readonly latencyMs?: number | null;
  readonly errorMessage?: string | null;
  readonly assertionResults?: readonly AssertionResultIngestionItem[];
  readonly toolExpectationResults?: readonly ToolExpectationResultIngestionItem[];
}

export interface AssertionResultIngestionItem {
  readonly assertionId: string;
  readonly status: ReviewStatus;
  readonly actualValue?: unknown;
  readonly expectedValue?: unknown;
  readonly reason?: string | null;
  readonly score?: number | null;
  readonly severity?: SeverityLevel | null;
  readonly metadata?: Record<string, unknown>;
}

export interface ToolExpectationResultIngestionItem {
  readonly toolExpectationId: string;
  readonly status: ReviewStatus;
  readonly expectedToolName?: string | null;
  readonly actualToolCalls?: unknown;
  readonly actualAgent?: string | null;
  readonly actualSteps?: unknown;
  readonly reason?: string | null;
  readonly score?: number | null;
  readonly metadata?: Record<string, unknown>;
}

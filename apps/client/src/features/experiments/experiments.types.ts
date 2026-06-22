import type { RunStatus } from "@/lib/api/types";
import type { RunMode } from "../runs/runs.types";

export type ExperimentStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface ExperimentVariantRequest {
  variantKey: string;
  name: string;
  targetId: string;
  runtimeOptions?: Record<string, unknown>;
}

export interface CreateExperimentRequest {
  datasetId: string;
  name: string;
  description?: string;
  runMode?: RunMode;
  selectedCaseIds?: string[];
  selectedSection?: string;
  includeLlmJudge?: boolean;
  includeToolExpectations?: boolean;
  maxConcurrency?: number;
  timeoutMs?: number;
  retryCount?: number;
  variants: ExperimentVariantRequest[];
}

export interface ExperimentVariantResponse {
  publicId: string;
  variantKey: string;
  name: string;
  targetPublicId: string;
  targetName: string;
  runPublicId: string;
  runStatus: RunStatus;
  runtimeOptions?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentResponse {
  publicId: string;
  projectPublicId: string;
  datasetPublicId: string;
  name: string;
  description: string;
  runMode: RunMode;
  selectedCaseIds: string[];
  selectedSection: string;
  includeLlmJudge: boolean;
  includeToolExpectations: boolean;
  maxConcurrency: number;
  timeoutMs: number;
  retryCount: number;
  status: ExperimentStatus;
  createdByPublicId: string;
  startedAt?: string;
  finishedAt?: string;
  variants: ExperimentVariantResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentFilterParams {
  page?: number;
  size?: number;
}

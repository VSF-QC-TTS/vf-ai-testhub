export type TestCaseSource = "MANUAL" | "IMPORTED" | "AI_GENERATED";
export type TestPriority = "P0" | "P1" | "P2" | "P3";

export interface TestCaseResponse {
  publicId: string;
  datasetPublicId: string;
  externalId?: string;
  sectionName?: string;
  name?: string;
  description?: string;
  input: string;
  expectedBehavior?: string;
  referenceAnswer?: string;
  variables?: Record<string, unknown>;
  preconditions?: string;
  tags?: string[];
  priority?: TestPriority;
  enabled: boolean;
  source?: TestCaseSource;
  generatedBy?: string;
  generationPrompt?: string;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFilterParams {
  sectionName?: string;
  priority?: TestPriority;
  enabled?: boolean;
  source?: TestCaseSource;
  tag?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface TestCaseCreateRequest {
  externalId?: string;
  sectionName?: string;
  name?: string;
  description?: string;
  input: string;
  expectedBehavior?: string;
  referenceAnswer?: string;
  variables?: Record<string, unknown>;
  preconditions?: string;
  tags?: string[];
  priority?: TestPriority;
  enabled: boolean;
  sortOrder?: number;
}

export interface TestCaseUpdateRequest {
  externalId?: string;
  sectionName?: string;
  name?: string;
  description?: string;
  input?: string;
  expectedBehavior?: string;
  referenceAnswer?: string;
  variables?: Record<string, unknown>;
  preconditions?: string;
  tags?: string[];
  priority?: TestPriority;
  enabled?: boolean;
  sortOrder?: number;
}

export type AssertionScope = "FIELD" | "COMPONENT" | "MULTI_FIELD" | "WHOLE_RESPONSE";

export type AssertionType = 
  | "contains"
  | "not_contains"
  | "equals"
  | "not_equals"
  | "regex"
  | "greater_than"
  | "less_than"
  | "between"
  | "is_true"
  | "is_false"
  | "field_exists"
  | "field_not_exists"
  | "array_length_greater_than"
  | "array_contains"
  | "llm_rubric";

export type SeverityLevel = "CRITICAL" | "MAJOR" | "MINOR" | "INFO";

export interface AssertionResponse {
  publicId: string;
  testCasePublicId: string;
  scope: AssertionScope;
  type: AssertionType;
  targetComponent?: string;
  fieldPath?: string;
  fieldPaths?: string[];
  expectedValue?: unknown;
  rubricPublicId?: string;
  rubricOverride?: string;
  threshold?: number;
  weight?: number;
  severity?: SeverityLevel;
  enabled: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssertionCreateRequest {
  scope: AssertionScope;
  type: AssertionType;
  targetComponent?: string;
  fieldPath?: string;
  fieldPaths?: string[];
  expectedValue?: unknown;
  rubricId?: string;
  rubricOverride?: string;
  threshold?: number;
  weight?: number;
  severity?: SeverityLevel;
  enabled?: boolean;
  sortOrder?: number;
}

export interface AssertionUpdateRequest {
  scope?: AssertionScope;
  type?: AssertionType;
  targetComponent?: string;
  fieldPath?: string;
  fieldPaths?: string[];
  expectedValue?: unknown;
  rubricId?: string;
  rubricOverride?: string;
  threshold?: number;
  weight?: number;
  severity?: SeverityLevel;
  enabled?: boolean;
  sortOrder?: number;
}
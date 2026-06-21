export type ReviewStatus = "PASSED" | "FAILED" | "ERROR" | "SKIPPED" | "UNCERTAIN";

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

export type ToolExpectationType =
  | "TOOL_MUST_BE_CALLED"
  | "TOOL_MUST_NOT_BE_CALLED"
  | "TOOL_ARGS_MATCH"
  | "TOOL_SEQUENCE_MATCH"
  | "TOOL_CALL_COUNT"
  | "TOOL_OUTPUT_USED_IN_ANSWER"
  | "AGENT_EQUALS"
  | "AGENT_NOT_EQUALS"
  | "AGENT_STEP_CONTAINS";

export type TargetSourceType =
  | "normalized_tool_calls"
  | "inferred_tool"
  | "inferred_agent"
  | "agent_steps"
  | "trace"
  | "custom_component";

export interface RunJobEnvelope {
  readonly runId: string;
  readonly correlationId: string;
  readonly snapshot: RunSnapshot;
  readonly publishedAt: string;
}

export interface RunSnapshot {
  readonly runId: string;
  readonly runMode: string;
  readonly projectId: string;
  readonly datasetId: string;
  readonly target: TargetSnapshot;
  readonly responseMapping: Record<string, unknown>;
  readonly testCases: readonly TestCaseSnapshot[];
  readonly options: RunOptions;
  readonly createdAt: string;
}

export interface RunOptions {
  readonly includeLlmJudge: boolean;
  readonly includeToolExpectations: boolean;
  readonly maxConcurrency: number | null;
  readonly timeoutMs: number | null;
  readonly retryCount: number | null;
}

export interface TargetSnapshot {
  readonly id: string;
  readonly name: string;
  readonly targetType: string;
  readonly method: string;
  readonly url: string;
  readonly queryParamsTemplate: Record<string, unknown>;
  readonly headersTemplate: Record<string, unknown>;
  readonly bodyTemplate: Record<string, unknown>;
  readonly authConfig: Record<string, unknown>;
  readonly inputBinding: Record<string, unknown>;
  readonly variableBindings: Record<string, unknown>;
  readonly timeoutMs: number | null;
}

export interface TestCaseSnapshot {
  readonly id: string;
  readonly externalId: string | null;
  readonly sectionName: string | null;
  readonly name: string | null;
  readonly input: string;
  readonly expectedBehavior: string | null;
  readonly referenceAnswer: string | null;
  readonly variables: Record<string, unknown>;
  readonly tags: readonly string[];
  readonly assertions: readonly AssertionSnapshot[];
  readonly toolExpectations: readonly ToolExpectationSnapshot[];
}

export interface AssertionSnapshot {
  readonly id: string;
  readonly scope: AssertionScope;
  readonly type: AssertionType;
  readonly targetComponent: string | null;
  readonly fieldPath: string | null;
  readonly fieldPaths: readonly string[];
  readonly expectedValue: unknown;
  readonly rubric: RubricSnapshot | null;
  readonly rubricOverride: string | null;
  readonly threshold: number | null;
  readonly weight: number | null;
  readonly severity: SeverityLevel;
}

export interface ToolExpectationSnapshot {
  readonly id: string;
  readonly expectationType: ToolExpectationType;
  readonly targetSource: TargetSourceType;
  readonly toolName: string | null;
  readonly agentName: string | null;
  readonly argumentAssertions: readonly Record<string, unknown>[];
  readonly sequence: readonly string[];
  readonly minCalls: number | null;
  readonly maxCalls: number | null;
  readonly rubric: RubricSnapshot | null;
  readonly rubricOverride: string | null;
  readonly threshold: number | null;
  readonly required: boolean;
  readonly severity: SeverityLevel;
}

export interface RubricSnapshot {
  readonly id: string;
  readonly scope: string;
  readonly category: string;
  readonly language: string;
  readonly content: string;
  readonly defaultThreshold: number | null;
}

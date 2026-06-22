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

export type SeverityLevel = "CRITICAL" | "MAJOR" | "MINOR" | "INFO";

export interface ToolExpectationResponse {
  publicId: string;
  testCasePublicId: string;
  expectationType: ToolExpectationType;
  targetSource?: TargetSourceType;
  toolName?: string;
  agentName?: string;
  argumentAssertions?: Record<string, unknown>[];
  sequence?: string[];
  minCalls?: number;
  maxCalls?: number;
  rubricPublicId?: string;
  rubricOverride?: string;
  threshold?: number;
  required: boolean;
  severity?: SeverityLevel;
  enabled: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ToolExpectationCreateRequest {
  expectationType: ToolExpectationType;
  targetSource?: TargetSourceType;
  toolName?: string;
  agentName?: string;
  argumentAssertions?: Record<string, unknown>[];
  sequence?: string[];
  minCalls?: number;
  maxCalls?: number;
  rubricId?: string;
  rubricOverride?: string;
  threshold?: number;
  required: boolean;
  severity?: SeverityLevel;
  enabled: boolean;
  sortOrder?: number;
}

export interface ToolExpectationUpdateRequest {
  expectationType?: ToolExpectationType;
  targetSource?: TargetSourceType;
  toolName?: string;
  agentName?: string;
  argumentAssertions?: Record<string, unknown>[];
  sequence?: string[];
  minCalls?: number;
  maxCalls?: number;
  rubricId?: string;
  rubricOverride?: string;
  threshold?: number;
  required: boolean;
  severity?: SeverityLevel;
  enabled: boolean;
  sortOrder?: number;
}

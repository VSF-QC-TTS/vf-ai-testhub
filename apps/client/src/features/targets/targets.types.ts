import type { UUID } from "../../lib/api/types";

export type TargetType = "HTTP" | "LLM";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type MissingFieldBehavior = "FAIL" | "SKIP" | "WARNING";

export interface ResponseMappingRequest {
  answerPath?: string | null;
  suggestionsPath?: string | null;
  intentPath?: string | null;
  confidencePath?: string | null;
  sourcesPath?: string | null;
  retrievalPath?: string | null;
  memoryPath?: string | null;
  rewritePath?: string | null;
  agentPath?: string | null;
  toolPath?: string | null;
  toolCallsPath?: string | null;
  traceIdPath?: string | null;
  latencyPath?: string | null;
  customComponents?: Record<string, unknown>[] | null;
  missingFieldBehavior?: MissingFieldBehavior | null;
}

export type ResponseMappingResponse = ResponseMappingRequest;

export interface TargetTestResponse {
  statusCode: number;
  responseTimeMs: number;
  responseBody: string | null;
  errorMessage: string | null;
}

export interface TargetRequest {
  projectId: UUID;
  name: string;
  environment?: string | null;
  targetType: TargetType;
  method?: HttpMethod | null;
  url?: string | null;
  queryParamsTemplate?: Record<string, unknown> | null;
  headersTemplate?: Record<string, unknown> | null;
  bodyTemplate?: Record<string, unknown> | null;
  authConfig?: Record<string, unknown> | null;
  llmProvider?: string | null;
  llmModel?: string | null;
  llmBaseUrl?: string | null;
  llmKeyRef?: string | null;
  inputBinding?: Record<string, unknown> | null;
  variableBindings?: Record<string, unknown> | null;
  timeoutMs?: number | null;
  isDefault?: boolean | null;
  responseMapping?: ResponseMappingRequest | null;
}

export interface TargetResponse {
  publicId: UUID;
  projectId: UUID;
  name: string;
  environment: string;
  targetType: TargetType;
  method: HttpMethod;
  url: string;
  queryParamsTemplate: Record<string, unknown>;
  headersTemplate: Record<string, unknown>;
  bodyTemplate: Record<string, unknown>;
  authConfig: Record<string, unknown>;
  llmProvider: string;
  llmModel: string;
  llmBaseUrl: string;
  llmKeyRef: string;
  inputBinding: Record<string, unknown>;
  variableBindings: Record<string, unknown>;
  timeoutMs: number;
  isDefault: boolean;
  responseMapping: ResponseMappingResponse;
  createdAt: string;
  updatedAt: string;
}

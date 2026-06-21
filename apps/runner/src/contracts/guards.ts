import { ValidationError } from "../errors/AppError.js";
import type { RunJobEnvelope, RunSnapshot } from "../types/RunSnapshot.js";
import type { ResultIngestionRequest } from "../types/ResultPayload.js";

export function parseRunJobEnvelope(raw: string): RunJobEnvelope {
  const value = parseJson(raw, "Run job payload must be JSON");
  if (!isRecord(value)) {
    throw new ValidationError("Run job payload must be an object");
  }
  assertString(value.runId, "runId");
  assertString(value.correlationId, "correlationId");
  assertString(value.publishedAt, "publishedAt");
  const snapshot = value.snapshot;
  assertRunSnapshot(snapshot);
  return value as unknown as RunJobEnvelope;
}

export function assertResultIngestionRequest(value: ResultIngestionRequest): void {
  if (typeof value.finalBatch !== "boolean") {
    throw new ValidationError("Result payload finalBatch must be boolean");
  }
  if (!Array.isArray(value.testResults)) {
    throw new ValidationError("Result payload testResults must be an array");
  }
  for (const result of value.testResults) {
    assertString(result.testCaseId, "testResults[].testCaseId");
    assertString(result.status, "testResults[].status");
    for (const assertion of result.assertionResults ?? []) {
      assertString(assertion.assertionId, "assertionResults[].assertionId");
      assertString(assertion.status, "assertionResults[].status");
    }
    for (const tool of result.toolExpectationResults ?? []) {
      assertString(tool.toolExpectationId, "toolExpectationResults[].toolExpectationId");
      assertString(tool.status, "toolExpectationResults[].status");
    }
  }
}

export function assertRunSnapshot(value: unknown): asserts value is RunSnapshot {
  if (!isRecord(value)) {
    throw new ValidationError("snapshot must be an object");
  }
  assertString(value.runId, "snapshot.runId");
  assertString(value.projectId, "snapshot.projectId");
  assertString(value.datasetId, "snapshot.datasetId");
  if (!isRecord(value.target)) {
    throw new ValidationError("snapshot.target must be an object");
  }
  assertString(value.target.id, "snapshot.target.id");
  assertString(value.target.method, "snapshot.target.method");
  assertString(value.target.url, "snapshot.target.url");
  if (!Array.isArray(value.testCases)) {
    throw new ValidationError("snapshot.testCases must be an array");
  }
  for (const testCase of value.testCases) {
    if (!isRecord(testCase)) {
      throw new ValidationError("snapshot.testCases[] must be an object");
    }
    assertString(testCase.id, "snapshot.testCases[].id");
    assertString(testCase.input, "snapshot.testCases[].input");
    if (!Array.isArray(testCase.assertions)) {
      throw new ValidationError("snapshot.testCases[].assertions must be an array");
    }
    if (!Array.isArray(testCase.toolExpectations)) {
      throw new ValidationError("snapshot.testCases[].toolExpectations must be an array");
    }
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(raw: string, message: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    throw new ValidationError(message, error);
  }
}

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${path} must be a non-empty string`);
  }
}

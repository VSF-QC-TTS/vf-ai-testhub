import type { ReviewStatus, ToolExpectationSnapshot } from "../types/RunSnapshot.js";
import type { ToolExpectationResultIngestionItem } from "../types/ResultPayload.js";

export class ToolExpectationEvaluator {
  public evaluate(
    expectation: ToolExpectationSnapshot,
    toolCalls: unknown,
  ): ToolExpectationResultIngestionItem {
    const calls = Array.isArray(toolCalls) ? toolCalls : [];
    const result = evaluateToolExpectation(expectation, calls);
    return {
      toolExpectationId: expectation.id,
      status: result.status,
      expectedToolName: expectation.toolName,
      actualToolCalls: calls,
      reason: result.reason,
      score: result.score,
      metadata: { expectationType: expectation.expectationType, targetSource: expectation.targetSource },
    };
  }
}

interface ToolEvaluation {
  readonly status: ReviewStatus;
  readonly reason: string;
  readonly score: number;
}

function evaluateToolExpectation(expectation: ToolExpectationSnapshot, calls: readonly unknown[]): ToolEvaluation {
  const matchingCount = countMatchingToolCalls(calls, expectation.toolName);
  let passed: boolean | null = null;
  switch (expectation.expectationType) {
    case "TOOL_MUST_BE_CALLED":
      passed = matchingCount > 0;
      break;
    case "TOOL_MUST_NOT_BE_CALLED":
      passed = matchingCount === 0;
      break;
    case "TOOL_CALL_COUNT":
      passed = withinCount(matchingCount, expectation.minCalls, expectation.maxCalls);
      break;
    case "TOOL_SEQUENCE_MATCH":
      passed = sequenceMatches(calls, expectation.sequence);
      break;
    case "TOOL_ARGS_MATCH":
    case "TOOL_OUTPUT_USED_IN_ANSWER":
    case "AGENT_EQUALS":
    case "AGENT_NOT_EQUALS":
    case "AGENT_STEP_CONTAINS":
      passed = null;
      break;
  }
  if (passed === null) {
    return {
      status: "UNCERTAIN",
      reason: `Tool expectation ${expectation.expectationType} requires trace/argument semantics not implemented by the domain evaluator`,
      score: 0,
    };
  }
  return {
    status: passed ? "PASSED" : "FAILED",
    reason: passed ? "Tool expectation passed" : `Tool expectation ${expectation.expectationType} failed`,
    score: passed ? 1 : 0,
  };
}

function countMatchingToolCalls(calls: readonly unknown[], toolName: string | null): number {
  if (toolName === null || toolName.trim().length === 0) {
    return calls.length;
  }
  return calls.filter((call) => {
    if (typeof call !== "object" || call === null) {
      return false;
    }
    const record = call as Record<string, unknown>;
    return record.name === toolName || record.toolName === toolName || record.tool === toolName;
  }).length;
}

function withinCount(count: number, min: number | null, max: number | null): boolean {
  return (min === null || count >= min) && (max === null || count <= max);
}

function sequenceMatches(calls: readonly unknown[], sequence: readonly string[]): boolean {
  if (sequence.length === 0) {
    return true;
  }
  const names = calls
    .map((call) => {
      if (typeof call !== "object" || call === null) {
        return undefined;
      }
      const record = call as Record<string, unknown>;
      return record.name ?? record.toolName ?? record.tool;
    })
    .filter((value): value is string => typeof value === "string");
  return sequence.every((name, index) => names[index] === name);
}

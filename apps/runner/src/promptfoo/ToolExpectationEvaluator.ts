import type { ToolExpectationSnapshot } from "../types/RunSnapshot.js";
import type { ToolExpectationResultIngestionItem } from "../types/ResultPayload.js";

export class ToolExpectationEvaluator {
  public evaluate(
    expectation: ToolExpectationSnapshot,
    toolCalls: unknown,
  ): ToolExpectationResultIngestionItem {
    const calls = Array.isArray(toolCalls) ? toolCalls : [];
    const passed = evaluateToolExpectation(expectation, calls);
    return {
      toolExpectationId: expectation.id,
      status: passed ? "PASSED" : "FAILED",
      expectedToolName: expectation.toolName,
      actualToolCalls: calls,
      reason: passed ? "Tool expectation passed" : `Tool expectation ${expectation.expectationType} failed`,
      score: passed ? 1 : 0,
      metadata: { expectationType: expectation.expectationType, targetSource: expectation.targetSource },
    };
  }
}

function evaluateToolExpectation(expectation: ToolExpectationSnapshot, calls: readonly unknown[]): boolean {
  const matchingCount = countMatchingToolCalls(calls, expectation.toolName);
  switch (expectation.expectationType) {
    case "TOOL_MUST_BE_CALLED":
      return matchingCount > 0;
    case "TOOL_MUST_NOT_BE_CALLED":
      return matchingCount === 0;
    case "TOOL_CALL_COUNT":
      return withinCount(matchingCount, expectation.minCalls, expectation.maxCalls);
    case "TOOL_SEQUENCE_MATCH":
      return sequenceMatches(calls, expectation.sequence);
    case "TOOL_ARGS_MATCH":
    case "TOOL_OUTPUT_USED_IN_ANSWER":
    case "AGENT_EQUALS":
    case "AGENT_NOT_EQUALS":
    case "AGENT_STEP_CONTAINS":
      return expectation.required ? matchingCount > 0 : true;
  }
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

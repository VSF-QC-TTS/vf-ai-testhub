import { describe, expect, it } from "vitest";
import { AssertionEvaluator } from "../promptfoo/AssertionEvaluator.js";
import { ToolExpectationEvaluator } from "../promptfoo/ToolExpectationEvaluator.js";
import type { AssertionSnapshot, ToolExpectationSnapshot } from "../types/RunSnapshot.js";

describe("domain evaluators", () => {
  it("evaluates contains assertions against components", () => {
    const evaluator = new AssertionEvaluator();

    const result = evaluator.evaluate(assertion(), {}, { answer: "VF 8 Eco and Plus" });

    expect(result.status).toBe("PASSED");
    expect(result.score).toBe(1);
  });

  it("evaluates required tool calls", () => {
    const evaluator = new ToolExpectationEvaluator();

    const result = evaluator.evaluate(toolExpectation(), [{ name: "search_product" }]);

    expect(result.status).toBe("PASSED");
  });

  it("does not pass LLM rubric assertions without an LLM judge", () => {
    const evaluator = new AssertionEvaluator();

    const result = evaluator.evaluate({ ...assertion(), type: "llm_rubric" }, {}, { answer: "ok" });

    expect(result.status).toBe("UNCERTAIN");
  });

  it("does not pass unsupported tool trace semantics", () => {
    const evaluator = new ToolExpectationEvaluator();

    const result = evaluator.evaluate(
      { ...toolExpectation(), expectationType: "TOOL_ARGS_MATCH" },
      [{ name: "search_product", arguments: { color: "red" } }],
    );

    expect(result.status).toBe("UNCERTAIN");
  });
});

function assertion(): AssertionSnapshot {
  return {
    id: "assertion-1",
    scope: "COMPONENT",
    type: "contains",
    targetComponent: "answer",
    fieldPath: null,
    fieldPaths: [],
    expectedValue: "Eco",
    rubric: null,
    rubricOverride: null,
    threshold: 0.8,
    weight: 1,
    severity: "MAJOR",
  };
}

function toolExpectation(): ToolExpectationSnapshot {
  return {
    id: "tool-1",
    expectationType: "TOOL_MUST_BE_CALLED",
    targetSource: "normalized_tool_calls",
    toolName: "search_product",
    agentName: null,
    argumentAssertions: [],
    sequence: [],
    minCalls: null,
    maxCalls: null,
    rubric: null,
    rubricOverride: null,
    threshold: 0.8,
    required: true,
    severity: "MAJOR",
  };
}

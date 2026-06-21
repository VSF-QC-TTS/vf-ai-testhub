import { FieldPathResolver } from "../normalizers/FieldPathResolver.js";
import type { AssertionSnapshot, ReviewStatus } from "../types/RunSnapshot.js";
import type { AssertionResultIngestionItem } from "../types/ResultPayload.js";

export class AssertionEvaluator {
  public constructor(private readonly fieldPathResolver = new FieldPathResolver()) {}

  public evaluate(
    assertion: AssertionSnapshot,
    responseBody: unknown,
    components: Record<string, unknown>,
  ): AssertionResultIngestionItem {
    const actualValue = this.resolveActualValue(assertion, responseBody, components);
    const ruleResult = evaluateRule(assertion, actualValue);
    return {
      assertionId: assertion.id,
      status: ruleResult.status,
      actualValue,
      expectedValue: assertion.expectedValue,
      reason: ruleResult.reason,
      score: ruleResult.score,
      severity: assertion.severity,
      metadata: { type: assertion.type, scope: assertion.scope },
    };
  }

  private resolveActualValue(
    assertion: AssertionSnapshot,
    responseBody: unknown,
    components: Record<string, unknown>,
  ): unknown {
    if (assertion.scope === "FIELD") {
      return this.fieldPathResolver.get(responseBody, assertion.fieldPath);
    }
    if (assertion.scope === "COMPONENT" && assertion.targetComponent !== null) {
      return components[assertion.targetComponent];
    }
    return responseBody;
  }
}

interface RuleEvaluation {
  readonly status: ReviewStatus;
  readonly reason: string;
  readonly score: number;
}

function evaluateRule(assertion: AssertionSnapshot, actualValue: unknown): RuleEvaluation {
  const expected = assertion.expectedValue;
  if (assertion.type === "llm_rubric") {
    return {
      status: "UNCERTAIN",
      reason: "LLM rubric assertions require an LLM judge and were not evaluated by the domain evaluator",
      score: 0,
    };
  }
  const passed = evaluateBooleanRule(assertion, actualValue, expected);
  if (passed === null) {
    return {
      status: "UNCERTAIN",
      reason: `Assertion ${assertion.type} could not be evaluated`,
      score: 0,
    };
  }
  return {
    status: passed ? "PASSED" : "FAILED",
    reason: passed ? "Assertion passed" : `Assertion ${assertion.type} failed`,
    score: passed ? 1 : 0,
  };
}

function evaluateBooleanRule(
  assertion: AssertionSnapshot,
  actualValue: unknown,
  expected: unknown,
): boolean | null {
  switch (assertion.type) {
    case "contains":
      return String(actualValue ?? "").includes(String(expected ?? ""));
    case "not_contains":
      return !String(actualValue ?? "").includes(String(expected ?? ""));
    case "equals":
      return JSON.stringify(actualValue) === JSON.stringify(expected);
    case "not_equals":
      return JSON.stringify(actualValue) !== JSON.stringify(expected);
    case "regex":
      try {
        return new RegExp(String(expected ?? "")).test(String(actualValue ?? ""));
      } catch {
        return null;
      }
    case "greater_than":
      return toNumber(actualValue) > toNumber(expected);
    case "less_than":
      return toNumber(actualValue) < toNumber(expected);
    case "between":
      return isBetween(actualValue, expected);
    case "is_true":
      return actualValue === true;
    case "is_false":
      return actualValue === false;
    case "field_exists":
      return actualValue !== undefined && actualValue !== null;
    case "field_not_exists":
      return actualValue === undefined || actualValue === null;
    case "array_length_greater_than":
      return Array.isArray(actualValue) && actualValue.length > toNumber(expected);
    case "array_contains":
      return Array.isArray(actualValue) && actualValue.some((item) => JSON.stringify(item) === JSON.stringify(expected));
    case "llm_rubric":
      return null;
  }
}

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isBetween(actualValue: unknown, expected: unknown): boolean {
  if (!Array.isArray(expected) || expected.length < 2) {
    return false;
  }
  const actual = toNumber(actualValue);
  return actual >= toNumber(expected[0]) && actual <= toNumber(expected[1]);
}

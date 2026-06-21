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
    const passed = evaluateRule(assertion, actualValue);
    return {
      assertionId: assertion.id,
      status: passed ? "PASSED" : "FAILED",
      actualValue,
      expectedValue: assertion.expectedValue,
      reason: passed ? "Assertion passed" : `Assertion ${assertion.type} failed`,
      score: passed ? 1 : 0,
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

function evaluateRule(assertion: AssertionSnapshot, actualValue: unknown): boolean {
  const expected = assertion.expectedValue;
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
      return new RegExp(String(expected ?? "")).test(String(actualValue ?? ""));
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
      return true;
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

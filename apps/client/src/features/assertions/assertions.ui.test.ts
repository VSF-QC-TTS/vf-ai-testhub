import { describe, expect, it } from "vitest";
import type { AssertionFormData } from "./assertions.schemas";
import { parseAssertionExpectedValue } from "./assertions.ui";

const baseForm: AssertionFormData = {
  scope: "FIELD",
  type: "contains",
  targetComponent: "",
  fieldPath: "$.answer",
  fieldPathsString: "",
  expectedValueString: "",
  expectedNumber: undefined,
  betweenMin: undefined,
  betweenMax: undefined,
  arrayValueMode: "text",
  rubricId: "",
  rubricOverride: "",
  threshold: 0.8,
  weight: 1,
  severity: "MAJOR",
  enabled: true,
  sortOrder: 0,
};

describe("parseAssertionExpectedValue", () => {
  it("keeps text expected values as strings", () => {
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "contains",
      expectedValueString: "VF 8",
    })).toBe("VF 8");
  });

  it("serializes greater/less numeric checks as numbers", () => {
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "greater_than",
      expectedNumber: 80,
    })).toBe(80);
  });

  it("serializes between checks as runner-compatible [min, max]", () => {
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "between",
      betweenMin: 70,
      betweenMax: 90,
    })).toEqual([70, 90]);
  });

  it("omits expected values for boolean and existence checks", () => {
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "field_exists",
      expectedValueString: "ignored",
    })).toBeUndefined();
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "is_true",
      expectedValueString: "ignored",
    })).toBeUndefined();
  });

  it("parses array_contains values by selected mode", () => {
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "array_contains",
      arrayValueMode: "number",
      expectedValueString: "42",
    })).toBe(42);
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "array_contains",
      arrayValueMode: "boolean",
      expectedValueString: "true",
    })).toBe(true);
    expect(parseAssertionExpectedValue({
      ...baseForm,
      type: "array_contains",
      arrayValueMode: "json",
      expectedValueString: "{\"name\":\"VF 8\"}",
    })).toEqual({ name: "VF 8" });
  });
});

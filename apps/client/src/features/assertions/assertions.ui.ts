import type { TFunction } from "i18next";
import type { AssertionResponse, AssertionType } from "./assertions.types";
import type { AssertionFormData } from "./assertions.schemas";

export type AssertionGroup = "TEXT" | "NUMBER" | "BOOLEAN" | "ARRAY" | "LLM";
export type ArrayValueMode = "text" | "number" | "boolean" | "json";

interface AssertionTypeMeta {
  group: AssertionGroup;
  labelKey: string;
  fallbackLabel: string;
  descriptionKey: string;
  fallbackDescription: string;
}

export const ASSERTION_GROUPS: readonly {
  value: AssertionGroup;
  labelKey: string;
  fallbackLabel: string;
  descriptionKey: string;
  fallbackDescription: string;
}[] = [
  {
    value: "TEXT",
    labelKey: "assertions:groups.TEXT",
    fallbackLabel: "Text",
    descriptionKey: "assertions:groupDescriptions.TEXT",
    fallbackDescription: "Check words, exact phrases, or regex patterns.",
  },
  {
    value: "NUMBER",
    labelKey: "assertions:groups.NUMBER",
    fallbackLabel: "Number",
    descriptionKey: "assertions:groupDescriptions.NUMBER",
    fallbackDescription: "Compare scores, counts, latency, or numeric fields.",
  },
  {
    value: "BOOLEAN",
    labelKey: "assertions:groups.BOOLEAN",
    fallbackLabel: "Boolean / Existence",
    descriptionKey: "assertions:groupDescriptions.BOOLEAN",
    fallbackDescription: "Check true/false values or whether a field exists.",
  },
  {
    value: "ARRAY",
    labelKey: "assertions:groups.ARRAY",
    fallbackLabel: "Array",
    descriptionKey: "assertions:groupDescriptions.ARRAY",
    fallbackDescription: "Check array length or whether an array contains an item.",
  },
  {
    value: "LLM",
    labelKey: "assertions:groups.LLM",
    fallbackLabel: "LLM Rubric",
    descriptionKey: "assertions:groupDescriptions.LLM",
    fallbackDescription: "Ask the LLM judge to score nuanced response quality.",
  },
];

export const ASSERTION_TYPE_META: Record<AssertionType, AssertionTypeMeta> = {
  contains: {
    group: "TEXT",
    labelKey: "assertions:types.contains",
    fallbackLabel: "Contains",
    descriptionKey: "assertions:typeDescriptions.contains",
    fallbackDescription: "Actual text must include the expected text.",
  },
  not_contains: {
    group: "TEXT",
    labelKey: "assertions:types.not_contains",
    fallbackLabel: "Does not contain",
    descriptionKey: "assertions:typeDescriptions.not_contains",
    fallbackDescription: "Actual text must not include the forbidden text.",
  },
  equals: {
    group: "TEXT",
    labelKey: "assertions:types.equals",
    fallbackLabel: "Equals",
    descriptionKey: "assertions:typeDescriptions.equals",
    fallbackDescription: "Actual value must exactly match the expected text.",
  },
  not_equals: {
    group: "TEXT",
    labelKey: "assertions:types.not_equals",
    fallbackLabel: "Not equals",
    descriptionKey: "assertions:typeDescriptions.not_equals",
    fallbackDescription: "Actual value must be different from the expected text.",
  },
  regex: {
    group: "TEXT",
    labelKey: "assertions:types.regex",
    fallbackLabel: "Matches regex",
    descriptionKey: "assertions:typeDescriptions.regex",
    fallbackDescription: "Actual text must match the regex pattern.",
  },
  greater_than: {
    group: "NUMBER",
    labelKey: "assertions:types.greater_than",
    fallbackLabel: "Greater than",
    descriptionKey: "assertions:typeDescriptions.greater_than",
    fallbackDescription: "Actual number must be greater than the threshold.",
  },
  less_than: {
    group: "NUMBER",
    labelKey: "assertions:types.less_than",
    fallbackLabel: "Less than",
    descriptionKey: "assertions:typeDescriptions.less_than",
    fallbackDescription: "Actual number must be less than the threshold.",
  },
  between: {
    group: "NUMBER",
    labelKey: "assertions:types.between",
    fallbackLabel: "Between",
    descriptionKey: "assertions:typeDescriptions.between",
    fallbackDescription: "Actual number must be inside an inclusive range.",
  },
  is_true: {
    group: "BOOLEAN",
    labelKey: "assertions:types.is_true",
    fallbackLabel: "Is true",
    descriptionKey: "assertions:typeDescriptions.is_true",
    fallbackDescription: "Actual value must be true.",
  },
  is_false: {
    group: "BOOLEAN",
    labelKey: "assertions:types.is_false",
    fallbackLabel: "Is false",
    descriptionKey: "assertions:typeDescriptions.is_false",
    fallbackDescription: "Actual value must be false.",
  },
  field_exists: {
    group: "BOOLEAN",
    labelKey: "assertions:types.field_exists",
    fallbackLabel: "Field exists",
    descriptionKey: "assertions:typeDescriptions.field_exists",
    fallbackDescription: "Selected field must be present and non-null.",
  },
  field_not_exists: {
    group: "BOOLEAN",
    labelKey: "assertions:types.field_not_exists",
    fallbackLabel: "Field does not exist",
    descriptionKey: "assertions:typeDescriptions.field_not_exists",
    fallbackDescription: "Selected field must be missing or null.",
  },
  array_length_greater_than: {
    group: "ARRAY",
    labelKey: "assertions:types.array_length_greater_than",
    fallbackLabel: "Array length greater than",
    descriptionKey: "assertions:typeDescriptions.array_length_greater_than",
    fallbackDescription: "Array length must be greater than the threshold.",
  },
  array_contains: {
    group: "ARRAY",
    labelKey: "assertions:types.array_contains",
    fallbackLabel: "Array contains",
    descriptionKey: "assertions:typeDescriptions.array_contains",
    fallbackDescription: "Array must contain the expected item.",
  },
  llm_rubric: {
    group: "LLM",
    labelKey: "assertions:types.llm_rubric",
    fallbackLabel: "LLM rubric",
    descriptionKey: "assertions:typeDescriptions.llm_rubric",
    fallbackDescription: "Score response quality with reusable or case-specific criteria.",
  },
};

const TYPE_ORDER: readonly AssertionType[] = [
  "contains",
  "not_contains",
  "equals",
  "not_equals",
  "regex",
  "greater_than",
  "less_than",
  "between",
  "is_true",
  "is_false",
  "field_exists",
  "field_not_exists",
  "array_length_greater_than",
  "array_contains",
  "llm_rubric",
];

export function getAssertionTypesForGroup(group: AssertionGroup): AssertionType[] {
  return TYPE_ORDER.filter((type) => ASSERTION_TYPE_META[type].group === group);
}

export function getAssertionGroup(type: AssertionType): AssertionGroup {
  return ASSERTION_TYPE_META[type].group;
}

export function getAssertionTypeLabel(t: TFunction, type: AssertionType): string {
  const meta = ASSERTION_TYPE_META[type];
  return t(meta.labelKey, meta.fallbackLabel);
}

export function getAssertionGroupLabel(t: TFunction, group: AssertionGroup): string {
  const meta = ASSERTION_GROUPS.find((item) => item.value === group);
  return meta ? t(meta.labelKey, meta.fallbackLabel) : group;
}

export function getAssertionTargetSummary(assertion: Pick<AssertionResponse, "scope" | "fieldPath" | "fieldPaths" | "targetComponent">): string {
  if (assertion.scope === "FIELD") {
    return assertion.fieldPath || "$";
  }
  if (assertion.scope === "MULTI_FIELD") {
    return assertion.fieldPaths?.length ? assertion.fieldPaths.join(", ") : "multiple fields";
  }
  if (assertion.scope === "COMPONENT") {
    return assertion.targetComponent || "component";
  }
  return "response";
}

export function formatExpectedValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

export function buildAssertionSummary(t: TFunction, assertion: Pick<AssertionResponse, "scope" | "type" | "fieldPath" | "fieldPaths" | "targetComponent" | "expectedValue" | "rubricPublicId" | "rubricOverride" | "threshold">): string {
  const target = getAssertionTargetSummary(assertion);
  const typeLabel = getAssertionTypeLabel(t, assertion.type).toLowerCase();

  if (assertion.type === "field_exists" || assertion.type === "field_not_exists") {
    return `${target} ${typeLabel}`;
  }
  if (assertion.type === "is_true" || assertion.type === "is_false") {
    return `${target} ${typeLabel}`;
  }
  if (assertion.type === "between" && Array.isArray(assertion.expectedValue)) {
    return `${target} ${typeLabel} ${assertion.expectedValue[0]} - ${assertion.expectedValue[1]}`;
  }
  if (assertion.type === "llm_rubric") {
    const source = assertion.rubricPublicId ? `rubric ${assertion.rubricPublicId}` : "rubric override";
    return `${target} ${typeLabel} (${source}, threshold ${assertion.threshold ?? 0.8})`;
  }
  return `${target} ${typeLabel} ${formatExpectedValue(assertion.expectedValue)}`;
}

export function parseAssertionExpectedValue(data: AssertionFormData): unknown {
  switch (data.type) {
    case "greater_than":
    case "less_than":
    case "array_length_greater_than":
      return data.expectedNumber;
    case "between":
      return [data.betweenMin, data.betweenMax];
    case "is_true":
    case "is_false":
    case "field_exists":
    case "field_not_exists":
    case "llm_rubric":
      return undefined;
    case "array_contains":
      return parseArrayContainsValue(data.arrayValueMode, data.expectedValueString);
    case "contains":
    case "not_contains":
    case "equals":
    case "not_equals":
    case "regex":
      return data.expectedValueString;
  }
}

export function parseArrayContainsValue(mode: ArrayValueMode | undefined, rawValue: string | undefined): unknown {
  const value = rawValue ?? "";
  if (mode === "number") {
    return Number(value);
  }
  if (mode === "boolean") {
    return value === "true";
  }
  if (mode === "json") {
    return JSON.parse(value);
  }
  return value;
}

export function stringifyEditableExpectedValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function extractBetweenRange(value: unknown): { min: number | undefined; max: number | undefined } {
  if (Array.isArray(value)) {
    return { min: toFiniteNumber(value[0]), max: toFiniteNumber(value[1]) };
  }
  if (value && typeof value === "object" && "min" in value && "max" in value) {
    const range = value as { min?: unknown; max?: unknown };
    return { min: toFiniteNumber(range.min), max: toFiniteNumber(range.max) };
  }
  return { min: undefined, max: undefined };
}

export function inferArrayValueMode(value: unknown): ArrayValueMode {
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (value && typeof value === "object") {
    return "json";
  }
  return "text";
}

function toFiniteNumber(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

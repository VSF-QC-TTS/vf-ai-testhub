import { z } from "zod";
import type { TFunction } from "i18next";
import { ASSERTION_TYPE_META } from "./assertions.ui";
import type { AssertionType } from "./assertions.types";

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return Number(value);
}, z.number().finite().optional());

const textValueTypes: AssertionType[] = ["contains", "not_contains", "equals", "not_equals", "regex"];

export const getAssertionSchema = (t: TFunction) => z.object({
  scope: z.enum(["FIELD", "COMPONENT", "MULTI_FIELD", "WHOLE_RESPONSE"]),
  type: z.enum([
    "contains", "not_contains", "equals", "not_equals", "regex", 
    "greater_than", "less_than", "between", "is_true", "is_false", 
    "field_exists", "field_not_exists", "array_length_greater_than", 
    "array_contains", "llm_rubric"
  ]),
  targetComponent: z.string().max(100, t("assertions:form.validation.maxComponentLength")).optional(),
  fieldPath: z.string().max(500, t("assertions:form.validation.maxPathLength")).optional(),
  fieldPathsString: z.string().optional(),
  expectedValueString: z.string().optional(),
  expectedNumber: optionalNumber,
  betweenMin: optionalNumber,
  betweenMax: optionalNumber,
  arrayValueMode: z.enum(["text", "number", "boolean", "json"]).optional(),
  rubricId: z.string().optional(),
  rubricOverride: z.string().optional(),
  threshold: z.coerce.number().min(0, t("assertions:form.validation.minThreshold")).max(1, t("assertions:form.validation.maxThreshold")).optional(),
  weight: z.coerce.number().min(0.0001, t("assertions:form.validation.minWeight")).optional(),
  severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "INFO"]).optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.coerce.number().min(0, t("assertions:form.validation.minOrder")).max(1000000, t("assertions:form.validation.maxOrder")).optional(),
}).refine(data => {
  if (data.scope === "FIELD" && !data.fieldPath) {
    return false;
  }
  return true;
}, {
  message: t("assertions:form.validation.fieldPathRequired"),
  path: ["fieldPath"]
}).refine(data => {
  if (data.scope === "COMPONENT" && !data.targetComponent) {
    return false;
  }
  return true;
}, {
  message: t("assertions:form.validation.componentRequired"),
  path: ["targetComponent"]
}).refine(data => {
  if (data.scope === "MULTI_FIELD") {
    return Boolean(data.fieldPathsString?.split(",").map(path => path.trim()).filter(Boolean).length);
  }
  return true;
}, {
  message: t("assertions:form.validation.fieldPathsRequired"),
  path: ["fieldPathsString"]
}).refine(data => {
  if (textValueTypes.includes(data.type)) {
    return Boolean(data.expectedValueString?.trim());
  }
  return true;
}, {
  message: t("assertions:form.validation.expectedValueRequired"),
  path: ["expectedValueString"]
}).refine(data => {
  if (data.type === "greater_than" || data.type === "less_than" || data.type === "array_length_greater_than") {
    return data.expectedNumber !== undefined;
  }
  return true;
}, {
  message: t("assertions:form.validation.expectedNumberRequired"),
  path: ["expectedNumber"]
}).refine(data => {
  if (data.type === "between") {
    return data.betweenMin !== undefined && data.betweenMax !== undefined;
  }
  return true;
}, {
  message: t("assertions:form.validation.rangeRequired"),
  path: ["betweenMin"]
}).refine(data => {
  if (data.type === "between" && data.betweenMin !== undefined && data.betweenMax !== undefined) {
    return data.betweenMin <= data.betweenMax;
  }
  return true;
}, {
  message: t("assertions:form.validation.rangeOrder"),
  path: ["betweenMax"]
}).refine(data => {
  if (data.type === "array_contains") {
    return Boolean(data.expectedValueString?.trim());
  }
  return true;
}, {
  message: t("assertions:form.validation.expectedValueRequired"),
  path: ["expectedValueString"]
}).refine(data => {
  if (data.type === "array_contains" && data.arrayValueMode === "json") {
    try {
      JSON.parse(data.expectedValueString ?? "");
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: t("assertions:form.validation.invalidJson"),
  path: ["expectedValueString"]
}).refine(data => {
  if (ASSERTION_TYPE_META[data.type].group === "NUMBER" && data.type !== "between") {
    return data.expectedNumber === undefined || Number.isFinite(data.expectedNumber);
  }
  return true;
}, {
  message: t("assertions:form.validation.expectedNumberRequired"),
  path: ["expectedNumber"]
}).refine(data => {
  if (data.type === "llm_rubric" && !data.rubricId && !data.rubricOverride) {
    return false;
  }
  return true;
}, {
  message: t("assertions:form.validation.rubricRequired"),
  path: ["rubricId"]
});

export type AssertionFormData = z.infer<ReturnType<typeof getAssertionSchema>>;

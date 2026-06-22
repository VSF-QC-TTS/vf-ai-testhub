import { z } from "zod";
import type { TFunction } from "i18next";

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
  if (data.type === "llm_rubric" && !data.rubricId && !data.rubricOverride) {
    return false;
  }
  return true;
}, {
  message: t("assertions:form.validation.rubricRequired"),
  path: ["rubricId"]
});

export type AssertionFormData = z.infer<ReturnType<typeof getAssertionSchema>>;
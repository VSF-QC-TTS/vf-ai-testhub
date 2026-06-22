import { z } from "zod";
import type { TFunction } from "i18next";

export const getTriggerRunSchema = (t: TFunction) => z.object({
  targetId: z.string().min(1, t("runs:form.validation.targetRequired")),
  runMode: z.enum(["FULL_DATASET", "SELECTED_SECTION", "SELECTED_CASES"]),
  sectionName: z.string().optional(),
  testCaseIds: z.array(z.string()).optional(),
  includeLlmJudge: z.boolean().default(true),
  includeToolExpectations: z.boolean().default(true),
  maxConcurrency: z.coerce.number().min(1, t("runs:form.validation.minConcurrency")).max(20, t("runs:form.validation.maxConcurrency")).default(3),
  timeoutMs: z.coerce.number().min(1000).default(30000),
  retryCount: z.coerce.number().min(0).max(5).default(0),
}).refine(data => {
  if (data.runMode === "SELECTED_SECTION" && !data.sectionName) return false;
  return true;
}, {
  message: t("runs:form.validation.sectionRequired"),
  path: ["sectionName"]
}).refine(data => {
  if (data.runMode === "SELECTED_CASES" && (!data.testCaseIds || data.testCaseIds.length === 0)) return false;
  return true;
}, {
  message: t("runs:form.validation.casesRequired"),
  path: ["testCaseIds"]
});

export type TriggerRunFormData = z.infer<ReturnType<typeof getTriggerRunSchema>>;

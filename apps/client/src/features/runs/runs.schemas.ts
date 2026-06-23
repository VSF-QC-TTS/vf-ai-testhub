import { z } from "zod";
import type { TFunction } from "i18next";

export const getTriggerRunSchema = (t: TFunction) => z.object({
  targetId: z.string().min(1, t("runs:form.validation.targetRequired")),
  runMode: z.enum(["FULL_DATASET", "SELECTED_SECTION", "SELECTED_CASES"]),
  selectedSection: z.string().optional(),
  selectedCaseIds: z.array(z.string()).optional(),
  includeLlmJudge: z.boolean().default(true),
  includeToolExpectations: z.boolean().default(true),
  maxConcurrency: z.coerce.number().min(1, t("runs:form.validation.minConcurrency")).max(50, t("runs:form.validation.maxConcurrency")).default(3),
  timeoutMs: z.coerce.number().min(1000).max(300000).default(30000),
  retryCount: z.coerce.number().min(0).max(5).default(0),
}).refine(data => {
  if (data.runMode === "SELECTED_SECTION" && !data.selectedSection) return false;
  return true;
}, {
  message: t("runs:form.validation.sectionRequired"),
  path: ["selectedSection"]
}).refine(data => {
  if (data.runMode === "SELECTED_CASES" && (!data.selectedCaseIds || data.selectedCaseIds.length === 0)) return false;
  return true;
}, {
  message: t("runs:form.validation.casesRequired"),
  path: ["selectedCaseIds"]
});

export type TriggerRunFormData = z.infer<ReturnType<typeof getTriggerRunSchema>>;

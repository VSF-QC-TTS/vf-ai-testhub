import { z } from "zod";
import type { TFunction } from "i18next";

export const getTriggerRunSchema = (t: TFunction) => z.object({
  targetId: z.string().min(1, t("runs:form.validation.targetRequired")),
  runMode: z.enum(["FULL_DATASET", "SELECTED_SECTION", "SELECTED_CASES"]),
  selectedSection: z.string().max(500, t("runs:form.validation.maxLength", { max: 500 })).optional(),
  selectedCaseIds: z.array(z.string()).optional(),
  includeLlmJudge: z.boolean().default(true),
  includeToolExpectations: z.boolean().default(true),
  maxConcurrency: z.coerce.number().min(1, t("runs:form.validation.minConcurrency")).max(50, t("runs:form.validation.maxConcurrency")).default(3),
  timeoutMs: z.coerce.number().min(1000, t("runs:form.validation.minTimeout")).max(300000, t("runs:form.validation.maxTimeout")).default(30000),
  retryCount: z.coerce.number().min(0, t("runs:form.validation.minRetry")).max(5, t("runs:form.validation.maxRetry")).default(0),
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

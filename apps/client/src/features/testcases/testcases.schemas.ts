import { z } from "zod";
import type { TFunction } from "i18next";

const isValidJson = (value: string | undefined): boolean => {
  if (!value) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const getTestCaseSchema = (t: TFunction) => z.object({
  externalId: z.string().max(255, t("testcases:form.validation.maxLength", { max: 255 })).optional(),
  sectionName: z.string().max(500, t("testcases:form.validation.maxLength", { max: 500 })).optional(),
  name: z.string().max(500, t("testcases:form.validation.maxLength", { max: 500 })).optional(),
  description: z.string().optional(),
  input: z.string().min(1, t("testcases:form.validation.inputRequired")),
  expectedBehavior: z.string().optional(),
  referenceAnswer: z.string().optional(),
  variablesString: z.string().refine(isValidJson, t("testcases:form.validation.invalidJson")).optional(),
  preconditions: z.string().optional(),
  tags: z.string().optional(), // Will be split by comma later
  priority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
  enabled: z.boolean(),
  sortOrder: z.number().min(0).max(1000000).optional(),
});

export type TestCaseFormData = z.infer<ReturnType<typeof getTestCaseSchema>>;

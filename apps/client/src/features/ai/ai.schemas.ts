import { z } from "zod";
import type { TFunction } from "i18next";
import type { TestCaseResponse } from "@/features/testcases/testcases.types";
import type { AssertionResponse } from "@/features/assertions/assertions.types";
import type { ToolExpectationResponse } from "@/features/toolexpectations/toolExpectations.types";

export const generateTestCasesSchema = (t: TFunction) => z.object({
  datasetId: z.uuid().optional(),
  projectContext: z.string().optional(),
  datasetContext: z.string().optional(),
  featureName: z.string().min(1, { message: t("common:validation.required") }),
  businessRequirement: z.string().min(1, { message: t("common:validation.required") }),
  policyContext: z.string().optional(),
  mockData: z.string().optional(),
  dbContext: z.string().optional(),
  language: z.string().optional(),
  count: z.number().min(1, { message: t("common:validation.min", { min: 1 }) }).max(50, { message: t("common:validation.max", { max: 50 }) }),
  categories: z.array(z.string()).optional(),
  availableComponents: z.array(z.string()).optional(),
  availableTools: z.array(z.string()).optional(),
  defaultRubrics: z.array(z.uuid()).optional(),
  existingTestcases: z.array(z.string().uuid()).optional(),
});

export type GenerateTestCasesDto = z.infer<ReturnType<typeof generateTestCasesSchema>>;

export interface TestCaseDraftDto {
  draftId: string;
  testCase: Partial<TestCaseResponse>;
  provenance: {
    prompt: string;
    model: string;
    generatedAt: string;
  };
}

export const suggestAssertionsSchema = (t: TFunction) => z.object({
  testCaseId: z.uuid().optional(),
  input: z.string().min(1, { message: t("common:validation.required") }),
  expectedBehavior: z.string().min(1, { message: t("common:validation.required") }),
  referenceAnswer: z.string().optional(),
  responseMappingContext: z.string().optional(),
  language: z.string().optional(),
  availableComponents: z.array(z.string()).optional(),
  availableTools: z.array(z.string()).optional(),
});

export type SuggestAssertionsDto = z.infer<ReturnType<typeof suggestAssertionsSchema>>;

export interface AssertionDraftDto {
  draftId: string;
  assertion: Partial<AssertionResponse> & { rubricId?: string };
}

export interface ToolExpectationDraftDto {
  draftId: string;
  toolExpectation: Partial<ToolExpectationResponse>;
}

export interface SuggestionResponseDto {
  assertions: AssertionDraftDto[];
  toolExpectations: ToolExpectationDraftDto[];
  provenance: {
    prompt: string;
    model: string;
    generatedAt: string;
  };
}

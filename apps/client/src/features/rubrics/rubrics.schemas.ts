import { z } from "zod";
import type { TFunction } from "i18next";
import type { PageResponse } from "@/lib/api/types";

export const RubricCategory = {
  ANSWER_QUALITY: "ANSWER_QUALITY",
  POLICY_COMPLIANCE: "POLICY_COMPLIANCE",
  NO_HALLUCINATION: "NO_HALLUCINATION",
  SAFETY_REFUSAL: "SAFETY_REFUSAL",
  RAG_FAITHFULNESS: "RAG_FAITHFULNESS",
  TOOL_OUTPUT_USAGE: "TOOL_OUTPUT_USAGE",
  SUGGESTION_RELEVANCE: "SUGGESTION_RELEVANCE",
  VIETNAMESE_TONE: "VIETNAMESE_TONE",
  CLARIFYING_QUESTION: "CLARIFYING_QUESTION",
  BUSINESS_ACCEPTANCE: "BUSINESS_ACCEPTANCE"
} as const;

export type RubricCategory = (typeof RubricCategory)[keyof typeof RubricCategory];

export const RubricScope = {
  GLOBAL: "GLOBAL",
  PROJECT: "PROJECT",
  DATASET: "DATASET",
  TESTCASE_OVERRIDE: "TESTCASE_OVERRIDE"
} as const;

export type RubricScope = (typeof RubricScope)[keyof typeof RubricScope];

export const RubricResponseSchema = z.object({
  publicId: z.string().uuid(),
  scope: z.nativeEnum(RubricScope),
  projectPublicId: z.string().uuid().nullable().optional(),
  datasetPublicId: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.nativeEnum(RubricCategory).nullable().optional(),
  language: z.string().nullable().optional(),
  content: z.string(),
  defaultThreshold: z.number().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  createdByPublicId: z.string().uuid().nullable().optional(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RubricSnapshotDto = z.infer<typeof RubricResponseSchema>;

export type RubricPageResponse = PageResponse<RubricSnapshotDto>;

export const createRubricSchema = (t: TFunction) => z.object({
  name: z.string().min(1, { message: t("common:validation.required") }).max(255, { message: t("common:validation.maxLength", { max: 255 }) }),
  description: z.string().optional(),
  scope: z.nativeEnum(RubricScope).optional(),
  datasetId: z.string().uuid().optional(),
  category: z.nativeEnum(RubricCategory).optional(),
  language: z.string().max(10, { message: t("common:validation.maxLength", { max: 10 }) }).optional(),
  content: z.string().min(1, { message: t("common:validation.required") }),
  defaultThreshold: z.number().min(0, { message: t("common:validation.min", { min: 0 }) }).max(1, { message: t("common:validation.max", { max: 1 }) }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateRubricDto = z.infer<ReturnType<typeof createRubricSchema>>;

export const updateRubricSchema = (t: TFunction) => z.object({
  name: z.string().max(255, { message: t("common:validation.maxLength", { max: 255 }) }).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(RubricCategory).optional(),
  language: z.string().max(10, { message: t("common:validation.maxLength", { max: 10 }) }).optional(),
  content: z.string().optional(),
  defaultThreshold: z.number().min(0, { message: t("common:validation.min", { min: 0 }) }).max(1, { message: t("common:validation.max", { max: 1 }) }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  archived: z.boolean().optional(),
});

export type UpdateRubricDto = z.infer<ReturnType<typeof updateRubricSchema>>;

export interface RubricFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  category?: RubricCategory | "";
  scope?: RubricScope | "";
  search?: string;
  archived?: boolean;
}

import { z } from "zod";
import type { TFunction } from "i18next";


export const getResponseMappingSchema = () => z.object({
  answerPath: z.string().max(500).optional().nullable(),
  suggestionsPath: z.string().max(500).optional().nullable(),
  intentPath: z.string().max(500).optional().nullable(),
  confidencePath: z.string().max(500).optional().nullable(),
  sourcesPath: z.string().max(500).optional().nullable(),
  retrievalPath: z.string().max(500).optional().nullable(),
  memoryPath: z.string().max(500).optional().nullable(),
  rewritePath: z.string().max(500).optional().nullable(),
  agentPath: z.string().max(500).optional().nullable(),
  toolPath: z.string().max(500).optional().nullable(),
  toolCallsPath: z.string().max(500).optional().nullable(),
  traceIdPath: z.string().max(500).optional().nullable(),
  latencyPath: z.string().max(500).optional().nullable(),
  missingFieldBehavior: z.enum(["FAIL", "SKIP", "WARNING"] as const).optional().nullable(),
});

export const getTargetSchema = (t: TFunction) => z.object({
  projectId: z.string().uuid(t("common:validation.invalidId")),
  name: z.string().min(1, t("common:validation.required")).max(255, t("common:validation.maxLength", { max: 255 })),
  environment: z.string().max(50, t("common:validation.maxLength", { max: 50 })).optional().nullable(),
  targetType: z.enum(["HTTP"] as const),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"] as const).optional().nullable(),
  url: z.string().url(t("common:validation.invalidUrl")).optional().nullable().or(z.literal("")),
  queryParamsTemplate: z.record(z.string(), z.unknown()).optional().nullable(),
  headersTemplate: z.record(z.string(), z.unknown()).optional().nullable(),
  bodyTemplate: z.record(z.string(), z.unknown()).optional().nullable(),
  authConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  timeoutMs: z.number().min(1000, t("common:validation.min", { min: 1000 })).max(300000, t("common:validation.max", { max: 300000 })).optional().nullable(),
  isDefault: z.boolean().optional().nullable(),
  responseMapping: getResponseMappingSchema().optional().nullable(),
});

export type TargetFormData = z.infer<ReturnType<typeof getTargetSchema>>;
export type ResponseMappingFormData = z.infer<ReturnType<typeof getResponseMappingSchema>>;

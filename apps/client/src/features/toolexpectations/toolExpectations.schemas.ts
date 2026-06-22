import { z } from "zod";
import type { TFunction } from "i18next";

const isValidJsonArray = (value: string | undefined): boolean => {
  if (!value) return true;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
};

export const getToolExpectationSchema = (t: TFunction) => z.object({
  expectationType: z.enum([
    "TOOL_MUST_BE_CALLED", "TOOL_MUST_NOT_BE_CALLED", "TOOL_ARGS_MATCH",
    "TOOL_SEQUENCE_MATCH", "TOOL_CALL_COUNT", "TOOL_OUTPUT_USED_IN_ANSWER",
    "AGENT_EQUALS", "AGENT_NOT_EQUALS", "AGENT_STEP_CONTAINS"
  ]),
  targetSource: z.enum([
    "normalized_tool_calls", "inferred_tool", "inferred_agent", 
    "agent_steps", "trace", "custom_component"
  ]).optional(),
  toolName: z.string().max(255, t("toolexpectations:form.validation.maxLength", { max: 255 })).optional(),
  agentName: z.string().max(255, t("toolexpectations:form.validation.maxLength", { max: 255 })).optional(),
  argumentAssertionsString: z.string().refine(isValidJsonArray, t("toolexpectations:form.validation.invalidJsonArray")).optional(),
  sequenceString: z.string().optional(),
  minCalls: z.coerce.number().min(0, t("toolexpectations:form.validation.minCalls")).optional(),
  maxCalls: z.coerce.number().min(0, t("toolexpectations:form.validation.maxCalls")).optional(),
  rubricId: z.string().optional(),
  rubricOverride: z.string().optional(),
  threshold: z.coerce.number().min(0, t("toolexpectations:form.validation.minThreshold")).max(1, t("toolexpectations:form.validation.maxThreshold")).optional(),
  required: z.boolean().optional().default(true),
  severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "INFO"]).optional(),
  enabled: z.boolean().optional().default(true),
  sortOrder: z.number().min(0).max(1000000).optional(),
});

export type ToolExpectationFormData = z.infer<ReturnType<typeof getToolExpectationSchema>>;

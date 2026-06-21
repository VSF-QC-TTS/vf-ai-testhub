import type { ReviewStatus } from "../types/RunSnapshot.js";
import { FieldPathResolver } from "./FieldPathResolver.js";

export interface NormalizedResponse {
  readonly components: Record<string, unknown>;
  readonly toolCalls: unknown;
  readonly mappingStatus: ReviewStatus | null;
  readonly mappingMessages: readonly string[];
}

type MissingFieldBehavior = "FAIL" | "SKIP" | "WARNING";

export class ResponseNormalizer {
  public constructor(private readonly fieldPathResolver = new FieldPathResolver()) {}

  public normalize(rawResponse: unknown, mapping: Record<string, unknown>): NormalizedResponse {
    const components: Record<string, unknown> = {};
    const mappingMessages: string[] = [];
    const missingFieldBehavior = readMissingFieldBehavior(mapping.missingFieldBehavior);
    for (const [key, value] of Object.entries(mapping)) {
      if (!key.endsWith("Path") || typeof value !== "string") {
        continue;
      }
      const componentName = key.replace(/Path$/, "");
      const resolved = this.fieldPathResolver.get(rawResponse, value);
      if (resolved !== undefined) {
        components[componentName] = resolved;
        continue;
      }
      if (missingFieldBehavior !== "SKIP") {
        mappingMessages.push(`Missing response mapping field ${componentName} at ${value}`);
      }
    }
    const toolCalls = components.toolCalls ?? components.normalizedToolCalls ?? [];
    return {
      components,
      toolCalls,
      mappingStatus: resolveMappingStatus(missingFieldBehavior, mappingMessages),
      mappingMessages,
    };
  }
}

function readMissingFieldBehavior(value: unknown): MissingFieldBehavior {
  return value === "SKIP" || value === "WARNING" || value === "FAIL" ? value : "FAIL";
}

function resolveMappingStatus(
  behavior: MissingFieldBehavior,
  messages: readonly string[],
): ReviewStatus | null {
  if (messages.length === 0) {
    return null;
  }
  if (behavior === "WARNING") {
    return "UNCERTAIN";
  }
  if (behavior === "FAIL") {
    return "FAILED";
  }
  return null;
}

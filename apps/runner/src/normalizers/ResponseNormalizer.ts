import { FieldPathResolver } from "./FieldPathResolver.js";

export interface NormalizedResponse {
  readonly components: Record<string, unknown>;
  readonly toolCalls: unknown;
}

export class ResponseNormalizer {
  public constructor(private readonly fieldPathResolver = new FieldPathResolver()) {}

  public normalize(rawResponse: unknown, mapping: Record<string, unknown>): NormalizedResponse {
    const components: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(mapping)) {
      if (!key.endsWith("Path") || typeof value !== "string") {
        continue;
      }
      const componentName = key.replace(/Path$/, "");
      const resolved = this.fieldPathResolver.get(rawResponse, value);
      if (resolved !== undefined) {
        components[componentName] = resolved;
      }
    }
    const toolCalls = components.toolCalls ?? components.normalizedToolCalls ?? [];
    return { components, toolCalls };
  }
}

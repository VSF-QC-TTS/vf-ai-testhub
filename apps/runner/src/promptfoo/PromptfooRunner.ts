import type { PromptfooTestSuite } from "./PromptfooConfigBuilder.js";

export interface PromptfooRunResult {
  readonly rawSummary: unknown;
}

export interface PromptfooEvaluate {
  (suite: unknown, options: { readonly maxConcurrency: number }): Promise<PromptfooEvalRecord | unknown>;
}

export interface PromptfooEvalRecord {
  readonly toEvaluateSummary?: () => Promise<unknown>;
}

export class PromptfooRunner {
  public constructor(private readonly evaluate?: PromptfooEvaluate) {}

  public async run(suite: PromptfooTestSuite, maxConcurrency: number): Promise<PromptfooRunResult> {
    const evaluate = this.evaluate ?? (await loadPromptfooEvaluate());
    const result = await evaluate(suite, { maxConcurrency });
    if (isPromptfooEvalRecord(result) && result.toEvaluateSummary !== undefined) {
      return { rawSummary: await result.toEvaluateSummary() };
    }
    return { rawSummary: result };
  }
}

async function loadPromptfooEvaluate(): Promise<PromptfooEvaluate> {
  const module = (await import("promptfoo")) as unknown as PromptfooModule;
  const evaluate = module.default?.evaluate ?? module.evaluate;
  if (typeof evaluate !== "function") {
    throw new Error("promptfoo evaluate API is unavailable");
  }
  return evaluate;
}

interface PromptfooModule {
  readonly default?: {
    readonly evaluate?: PromptfooEvaluate;
  };
  readonly evaluate?: PromptfooEvaluate;
}

function isPromptfooEvalRecord(value: unknown): value is PromptfooEvalRecord {
  return typeof value === "object" && value !== null && "toEvaluateSummary" in value;
}

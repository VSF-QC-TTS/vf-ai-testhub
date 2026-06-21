import type { PromptfooTestSuite } from "./PromptfooConfigBuilder.js";

export interface PromptfooRunResult {
  readonly rawSummary: unknown;
}

export interface PromptfooEvaluate {
  (suite: PromptfooTestSuite, options: { readonly maxConcurrency: number }): Promise<unknown>;
}

export class PromptfooRunner {
  public constructor(private readonly evaluate?: PromptfooEvaluate) {}

  public async run(suite: PromptfooTestSuite, maxConcurrency: number): Promise<PromptfooRunResult> {
    if (this.evaluate === undefined) {
      return { rawSummary: { skipped: true, reason: "promptfoo evaluate is not injected" } };
    }
    const result = await this.evaluate(suite, { maxConcurrency });
    return { rawSummary: result };
  }
}

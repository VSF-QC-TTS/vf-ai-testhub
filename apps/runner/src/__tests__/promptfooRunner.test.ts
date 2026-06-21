import { describe, expect, it } from "vitest";
import { PromptfooRunner } from "../promptfoo/PromptfooRunner.js";
import type { PromptfooTestSuite } from "../promptfoo/PromptfooConfigBuilder.js";

describe("PromptfooRunner", () => {
  it("converts promptfoo eval records to evaluate summaries", async () => {
    const suite = { prompts: [], providers: [], tests: [], description: "test" } satisfies PromptfooTestSuite;
    const runner = new PromptfooRunner(async () => ({
      toEvaluateSummary: async () => ({ stats: { successes: 1, failures: 0, errors: 0 } }),
    }));

    const result = await runner.run(suite, 1);

    expect(result.rawSummary).toEqual({ stats: { successes: 1, failures: 0, errors: 0 } });
  });
});

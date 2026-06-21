import type { RunSnapshot } from "../types/RunSnapshot.js";

export interface PromptfooTestSuite {
  readonly description: string;
  readonly prompts: readonly string[];
  readonly providers: readonly unknown[];
  readonly tests: readonly PromptfooTestCase[];
}

export interface PromptfooTestCase {
  readonly vars: Record<string, unknown>;
  readonly assert: readonly Record<string, unknown>[];
  readonly metadata: Record<string, unknown>;
}

export class PromptfooConfigBuilder {
  public build(snapshot: RunSnapshot): PromptfooTestSuite {
    return {
      description: `AI TestHub run ${snapshot.runId}`,
      prompts: ["{{input}}"],
      providers: ["ai-testhub-custom-provider"],
      tests: snapshot.testCases.map((testCase) => ({
        vars: {
          input: testCase.input,
          expectedBehavior: testCase.expectedBehavior,
          referenceAnswer: testCase.referenceAnswer,
          ...testCase.variables,
        },
        assert: testCase.assertions.map((assertion) => ({
          type: mapAssertionType(assertion.type),
          value: assertion.expectedValue,
          metric: assertion.id,
        })),
        metadata: {
          testCaseId: testCase.id,
          tags: testCase.tags,
        },
      })),
    };
  }
}

function mapAssertionType(type: string): string {
  if (type === "contains") {
    return "contains";
  }
  if (type === "not_contains") {
    return "not-contains";
  }
  if (type === "equals") {
    return "equals";
  }
  if (type === "regex") {
    return "regex";
  }
  if (type === "llm_rubric") {
    return "llm-rubric";
  }
  return "javascript";
}

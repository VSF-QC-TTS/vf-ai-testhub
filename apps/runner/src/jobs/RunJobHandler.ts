import type { TargetExecutionResult } from "../clients/TargetExecutor.js";
import { AppError } from "../errors/AppError.js";
import type { ResponseNormalizer } from "../normalizers/ResponseNormalizer.js";
import type { ResultReporter } from "../reporting/ResultReporter.js";
import type { ReviewStatus, RunJobEnvelope, RunSnapshot, TestCaseSnapshot } from "../types/RunSnapshot.js";
import type { TestResultIngestionItem } from "../types/ResultPayload.js";
import { AssertionEvaluator } from "../promptfoo/AssertionEvaluator.js";
import { ToolExpectationEvaluator } from "../promptfoo/ToolExpectationEvaluator.js";
import { PromptfooConfigBuilder } from "../promptfoo/PromptfooConfigBuilder.js";
import type { PromptfooRunner } from "../promptfoo/PromptfooRunner.js";

export class RunJobHandler {
  public constructor(
    private readonly targetExecutor: TargetRunner,
    private readonly responseNormalizer: ResponseNormalizer,
    private readonly resultReporterFactory: (runId: string) => ResultReporter,
    private readonly promptfooConfigBuilder = new PromptfooConfigBuilder(),
    private readonly promptfooRunner?: PromptfooRunner,
    private readonly assertionEvaluator = new AssertionEvaluator(),
    private readonly toolExpectationEvaluator = new ToolExpectationEvaluator(),
  ) {}

  public async handle(envelope: RunJobEnvelope): Promise<void> {
    const reporter = this.resultReporterFactory(envelope.runId);
    reporter.start();
    await this.runPromptfooIfConfigured(envelope.snapshot);
    for (const testCase of envelope.snapshot.testCases) {
      const result = await this.executeTestCase(envelope.snapshot, testCase);
      await reporter.add(result);
    }
    await reporter.finish();
  }

  private async runPromptfooIfConfigured(snapshot: RunSnapshot): Promise<void> {
    if (this.promptfooRunner === undefined) {
      return;
    }
    const suite = this.promptfooConfigBuilder.build(snapshot);
    await this.promptfooRunner.run(suite, snapshot.options.maxConcurrency ?? 3);
  }

  private async executeTestCase(
    snapshot: RunSnapshot,
    testCase: TestCaseSnapshot,
  ): Promise<TestResultIngestionItem> {
    try {
      const execution = await this.executeTargetWithRetries(
        snapshot.target,
        testCase,
        snapshot.options.timeoutMs ?? snapshot.target.timeoutMs ?? 30000,
        snapshot.options.retryCount ?? 0,
      );
      const normalized = this.responseNormalizer.normalize(execution.rawResponse.body, snapshot.responseMapping);
      const assertionResults = testCase.assertions.map((assertion) =>
        this.assertionEvaluator.evaluate(assertion, execution.rawResponse.body, normalized.components),
      );
      const toolExpectationResults = snapshot.options.includeToolExpectations
        ? testCase.toolExpectations.map((expectation) =>
            this.toolExpectationEvaluator.evaluate(expectation, normalized.toolCalls),
          )
        : [];
      const childStatuses = [
        normalized.mappingStatus,
        ...assertionResults.map((item) => item.status),
        ...toolExpectationResults.map((item) => item.status),
      ].filter((status): status is ReviewStatus => status !== null);
      const status = aggregateStatus(childStatuses);
      return {
        testCaseId: testCase.id,
        status,
        score: status === "PASSED" ? 1 : 0,
        requestSnapshot: execution.requestSnapshot,
        rawResponse: execution.rawResponse,
        responseSnapshot: execution.rawResponse,
        extractedComponents: normalized.components,
        extractedToolCalls: normalized.toolCalls,
        latencyMs: execution.latencyMs,
        errorMessage: normalized.mappingMessages.length > 0 ? normalized.mappingMessages.join("; ") : null,
        assertionResults,
        toolExpectationResults,
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        status: "ERROR",
        score: 0,
        errorMessage: error instanceof Error ? error.message : "Unknown runner error",
        assertionResults: [],
        toolExpectationResults: [],
      };
    }
  }

  private async executeTargetWithRetries(
    target: RunSnapshot["target"],
    testCase: TestCaseSnapshot,
    timeoutMs: number,
    retryCount: number,
  ): Promise<TargetExecutionResult> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        return await this.targetExecutor.execute(target, testCase, timeoutMs);
      } catch (error) {
        lastError = error;
        if (!isRetryable(error) || attempt >= retryCount) {
          throw error;
        }
        await delay(Math.min(1000, 100 * (attempt + 1)));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Target request failed after retries");
  }
}

function aggregateStatus(statuses: readonly ReviewStatus[]): ReviewStatus {
  if (statuses.includes("ERROR")) {
    return "ERROR";
  }
  if (statuses.includes("FAILED")) {
    return "FAILED";
  }
  if (statuses.includes("UNCERTAIN")) {
    return "UNCERTAIN";
  }
  if (statuses.includes("SKIPPED")) {
    return "SKIPPED";
  }
  return "PASSED";
}

function isRetryable(error: unknown): boolean {
  return error instanceof AppError ? error.retryable : true;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface TargetRunner {
  execute(
    target: RunSnapshot["target"],
    testCase: TestCaseSnapshot,
    timeoutMs: number,
  ): Promise<TargetExecutionResult>;
}

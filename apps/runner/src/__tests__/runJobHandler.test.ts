import { describe, expect, it } from "vitest";
import { RunJobHandler } from "../jobs/RunJobHandler.js";
import type { TargetExecutionResult } from "../clients/TargetExecutor.js";
import type { TargetRunner } from "../jobs/RunJobHandler.js";
import { ResponseNormalizer } from "../normalizers/ResponseNormalizer.js";
import type { ResultReporter } from "../reporting/ResultReporter.js";
import type { TestResultIngestionItem } from "../types/ResultPayload.js";
import { runJobEnvelopeFixture } from "./runSnapshotFixture.js";

describe("RunJobHandler", () => {
  it("executes test cases and reports final results", async () => {
    const reported: TestResultIngestionItem[] = [];
    let finished = false;
    const targetExecutor = {
      execute: async (): Promise<TargetExecutionResult> => ({
        requestSnapshot: { body: { message: "hello" } },
        rawResponse: { body: { data: { answer: "hello Eco", tool_calls: [{ name: "search_product" }] } } },
        latencyMs: 25,
      }),
    } satisfies TargetRunner;
    const reporter = {
      start: () => undefined,
      add: async (result: TestResultIngestionItem) => {
        reported.push(result);
      },
      finish: async () => {
        finished = true;
      },
    } satisfies Pick<ResultReporter, "start" | "add" | "finish">;
    const handler = new RunJobHandler(
      targetExecutor,
      new ResponseNormalizer(),
      () => reporter as ResultReporter,
    );

    await handler.handle(runJobEnvelopeFixture());

    expect(reported).toHaveLength(1);
    expect(reported[0]?.status).toBe("PASSED");
    expect(reported[0]?.assertionResults).toHaveLength(1);
    expect(reported[0]?.toolExpectationResults).toHaveLength(1);
    expect(finished).toBe(true);
  });
});

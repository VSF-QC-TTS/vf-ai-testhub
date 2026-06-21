import { describe, expect, it } from "vitest";
import type { BackendClient } from "../clients/BackendClient.js";
import { ResultReporter } from "../reporting/ResultReporter.js";
import type { ResultIngestionRequest } from "../types/ResultPayload.js";

describe("ResultReporter", () => {
  it("flushes by batch size and sends final empty batch", async () => {
    const submissions: ResultIngestionRequest[] = [];
    const backendClient = {
      submitRunResults: async (_runId: string, payload: ResultIngestionRequest) => {
        submissions.push(payload);
      },
    } satisfies Pick<BackendClient, "submitRunResults">;
    const reporter = new ResultReporter(backendClient as BackendClient, "run-1", 2, 10000);

    await reporter.add({ testCaseId: "case-1", status: "PASSED" });
    await reporter.add({ testCaseId: "case-2", status: "FAILED" });
    await reporter.finish();

    expect(submissions).toEqual([
      {
        finalBatch: false,
        testResults: [
          { testCaseId: "case-1", status: "PASSED" },
          { testCaseId: "case-2", status: "FAILED" },
        ],
      },
      { finalBatch: true, testResults: [] },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { ValidationError } from "../errors/AppError.js";
import { assertResultIngestionRequest, parseRunJobEnvelope } from "../contracts/guards.js";
import type { ResultIngestionRequest } from "../types/ResultPayload.js";

describe("runner contracts", () => {
  it("parses a backend run job envelope", () => {
    const envelope = parseRunJobEnvelope(JSON.stringify(validEnvelope()));

    expect(envelope.runId).toBe("11111111-1111-1111-1111-111111111111");
    expect(envelope.snapshot.testCases).toHaveLength(1);
  });

  it("rejects invalid run snapshots", () => {
    const payload = validEnvelope();
    const firstTestCase = payload.snapshot.testCases[0];
    if (firstTestCase === undefined) {
      throw new Error("fixture must include one testcase");
    }
    firstTestCase.input = "";

    expect(() => parseRunJobEnvelope(JSON.stringify(payload))).toThrow(ValidationError);
  });

  it("validates result callback payloads", () => {
    const payload: ResultIngestionRequest = {
      finalBatch: true,
      testResults: [
        {
          testCaseId: "22222222-2222-2222-2222-222222222222",
          status: "PASSED",
          assertionResults: [
            {
              assertionId: "33333333-3333-3333-3333-333333333333",
              status: "PASSED",
            },
          ],
        },
      ],
    };

    expect(() => assertResultIngestionRequest(payload)).not.toThrow();
  });
});

function validEnvelope(): {
  runId: string;
  correlationId: string;
  publishedAt: string;
  snapshot: {
    runId: string;
    runMode: string;
    projectId: string;
    datasetId: string;
    target: Record<string, unknown>;
    responseMapping: Record<string, unknown>;
    testCases: Array<Record<string, unknown>>;
    options: Record<string, unknown>;
    createdAt: string;
  };
} {
  return {
    runId: "11111111-1111-1111-1111-111111111111",
    correlationId: "corr-1",
    publishedAt: "2026-06-22T00:00:00Z",
    snapshot: {
      runId: "11111111-1111-1111-1111-111111111111",
      runMode: "FULL_DATASET",
      projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      datasetId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      target: {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "Chatbot",
        targetType: "HTTP",
        method: "POST",
        url: "https://chatbot.test/api",
        queryParamsTemplate: {},
        headersTemplate: {},
        bodyTemplate: { message: "{{input}}" },
        authConfig: {},
        inputBinding: {},
        variableBindings: {},
        timeoutMs: 30000,
      },
      responseMapping: {},
      testCases: [
        {
          id: "22222222-2222-2222-2222-222222222222",
          externalId: null,
          sectionName: null,
          name: "Case",
          input: "hello",
          expectedBehavior: "answer",
          referenceAnswer: null,
          variables: {},
          tags: [],
          assertions: [],
          toolExpectations: [],
        },
      ],
      options: {
        includeLlmJudge: true,
        includeToolExpectations: true,
        maxConcurrency: 3,
        timeoutMs: 30000,
        retryCount: 0,
      },
      createdAt: "2026-06-22T00:00:00Z",
    },
  };
}

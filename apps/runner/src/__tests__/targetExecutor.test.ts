import { describe, expect, it } from "vitest";
import { TargetExecutor } from "../clients/TargetExecutor.js";
import type { TargetSnapshot, TestCaseSnapshot } from "../types/RunSnapshot.js";

describe("TargetExecutor", () => {
  it("interpolates input and variables into request body", async () => {
    const requests: RequestInit[] = [];
    const fetchImpl = async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      requests.push(init ?? {});
      return new Response(JSON.stringify({ answer: "ok" }), { status: 200 });
    };
    const ssrfGuard = { assertAllowed: async () => undefined };
    const executor = new TargetExecutor(ssrfGuard, fetchImpl as typeof fetch);

    const result = await executor.execute(target(), testCase(), 1000);

    expect(requests[0]?.body).toBe(JSON.stringify({ message: "hello", user: "u-1" }));
    expect(result.rawResponse.body).toEqual({ answer: "ok" });
  });
});

function target(): TargetSnapshot {
  return {
    id: "target-1",
    name: "Target",
    targetType: "HTTP",
    method: "POST",
    url: "https://chatbot.test/api",
    queryParamsTemplate: {},
    headersTemplate: { "content-type": "application/json" },
    bodyTemplate: { message: "{{input}}", user: "{{variables.userId}}" },
    authConfig: {},
    inputBinding: {},
    variableBindings: {},
    timeoutMs: 1000,
  };
}

function testCase(): TestCaseSnapshot {
  return {
    id: "case-1",
    externalId: null,
    sectionName: null,
    name: "Case",
    input: "hello",
    expectedBehavior: null,
    referenceAnswer: null,
    variables: { userId: "u-1" },
    tags: [],
    assertions: [],
    toolExpectations: [],
  };
}

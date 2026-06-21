import { describe, expect, it } from "vitest";
import { BackendClient } from "../clients/BackendClient.js";

describe("BackendClient", () => {
  it("submits result payload with runner token", async () => {
    const calls: RequestInit[] = [];
    const fetchImpl = async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      calls.push(init ?? {});
      return new Response(null, { status: 202 });
    };
    const client = new BackendClient("http://backend.test", "secret-token", fetchImpl as typeof fetch);

    await client.submitRunResults("run-1", {
      finalBatch: true,
      testResults: [{ testCaseId: "case-1", status: "PASSED" }],
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.headers).toMatchObject({
      "x-runner-token": "secret-token",
      "content-type": "application/json",
    });
  });
});

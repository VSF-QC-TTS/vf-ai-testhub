import { performance } from "node:perf_hooks";
import { ExternalServiceError } from "../errors/AppError.js";
import { SsrfGuard } from "../security/SsrfGuard.js";
import type { TargetSnapshot, TestCaseSnapshot } from "../types/RunSnapshot.js";

export interface TargetExecutionResult {
  readonly requestSnapshot: Record<string, unknown>;
  readonly rawResponse: Record<string, unknown>;
  readonly latencyMs: number;
}

export class TargetExecutor {
  public constructor(
    private readonly ssrfGuard = new SsrfGuard(),
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  public async execute(
    target: TargetSnapshot,
    testCase: TestCaseSnapshot,
    timeoutMs: number,
  ): Promise<TargetExecutionResult> {
    const url = new URL(target.url);
    await this.ssrfGuard.assertAllowed(url);
    const body = interpolate(target.bodyTemplate, testCase);
    const headers = stringifyHeaders(interpolate(target.headersTemplate, testCase));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const started = performance.now();
    try {
      const init: RequestInit = {
        method: target.method,
        headers,
        signal: controller.signal,
      };
      if (target.method.toUpperCase() !== "GET") {
        init.body = JSON.stringify(body);
      }
      const response = await this.fetchImpl(url, init);
      const rawResponse = await readResponse(response);
      return {
        requestSnapshot: {
          method: target.method,
          url: url.toString(),
          headers,
          body,
        },
        rawResponse,
        latencyMs: Math.round(performance.now() - started),
      };
    } catch (error) {
      throw new ExternalServiceError("TARGET_REQUEST_FAILED", "Target request failed", error, true);
    } finally {
      clearTimeout(timeout);
    }
  }
}

function interpolate(template: Record<string, unknown>, testCase: TestCaseSnapshot): Record<string, unknown> {
  return interpolateValue(template, testCase) as Record<string, unknown>;
}

function interpolateValue(value: unknown, testCase: TestCaseSnapshot): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll("{{input}}", testCase.input)
      .replace(/\{\{variables\.([^}]+)}}/g, (_match, key: string) => {
        const variable = testCase.variables[key];
        return variable === undefined || variable === null ? "" : String(variable);
      });
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, testCase));
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, interpolateValue(child, testCase)]),
    );
  }
  return value;
}

function stringifyHeaders(value: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, child === undefined ? "" : String(child)]),
  );
}

async function readResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (text.trim().length === 0) {
    return { status: response.status, ok: response.ok };
  }
  try {
    const parsed = JSON.parse(text) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? ({ status: response.status, ok: response.ok, body: parsed } satisfies Record<string, unknown>)
      : { status: response.status, ok: response.ok, body: parsed };
  } catch {
    return { status: response.status, ok: response.ok, body: text };
  }
}

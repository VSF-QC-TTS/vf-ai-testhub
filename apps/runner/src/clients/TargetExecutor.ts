import { performance } from "node:perf_hooks";
import { ExternalServiceError } from "../errors/AppError.js";
import { RedactionService } from "../security/RedactionService.js";
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
    private readonly redactionService = new RedactionService(),
  ) {}

  public async execute(
    target: TargetSnapshot,
    testCase: TestCaseSnapshot,
    timeoutMs: number,
  ): Promise<TargetExecutionResult> {
    if (target.targetType !== "HTTP") {
      throw new ExternalServiceError(
        "UNSUPPORTED_TARGET_TYPE",
        `Target type "${target.targetType}" is not yet supported by the runner. Only HTTP targets can be executed.`,
        undefined,
        false,
      );
    }
    const url = applyQueryParams(new URL(target.url), interpolate(target.queryParamsTemplate, testCase));
    const body = interpolate(target.bodyTemplate, testCase);
    const headers = applyAuthConfig(
      stringifyHeaders(interpolate(target.headersTemplate, testCase)),
      target.authConfig,
      url,
    );
    await this.ssrfGuard.assertAllowed(url);
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
          headers: this.redactionService.redact(headers),
          body: this.redactionService.redact(body),
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
      .replaceAll("{{prompt}}", testCase.input)
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

function applyQueryParams(url: URL, queryParams: Record<string, unknown>): URL {
  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      url.searchParams.delete(key);
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url;
}

function stringifyHeaders(value: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, child === undefined ? "" : String(child)]),
  );
}

function applyAuthConfig(
  headers: Record<string, string>,
  authConfig: Record<string, unknown>,
  url: URL,
): Record<string, string> {
  const type = readString(authConfig, "type", "authType", "scheme").toLowerCase();
  if (type.length === 0 || type === "none") {
    return headers;
  }
  if (type === "bearer" || type === "bearer_token") {
    const token = readSecret(authConfig, "token", "value", "apiKey", "secret");
    return token.length > 0 ? { ...headers, Authorization: `Bearer ${token}` } : headers;
  }
  if (type === "basic") {
    const username = readSecret(authConfig, "username", "user");
    const password = readSecret(authConfig, "password", "pass");
    return username.length > 0 || password.length > 0
      ? { ...headers, Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` }
      : headers;
  }
  if (type === "api_key" || type === "apikey" || type === "api-key") {
    const value = readSecret(authConfig, "value", "apiKey", "token", "secret");
    if (value.length === 0) {
      return headers;
    }
    const placement = readString(authConfig, "in", "placement", "location").toLowerCase();
    if (placement === "query") {
      const paramName = readString(authConfig, "paramName", "name", "key");
      if (paramName.length > 0) {
        url.searchParams.set(paramName, value);
      }
      return headers;
    }
    const headerName = readString(authConfig, "headerName", "name", "key") || "X-API-Key";
    return { ...headers, [headerName]: value };
  }
  return headers;
}

function readString(record: Record<string, unknown>, ...keys: readonly string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function readSecret(record: Record<string, unknown>, ...keys: readonly string[]): string {
  const envName = readString(record, "env", "envName", "envVar", "ref", "secretRef", "keyRef");
  if (envName.length > 0) {
    return process.env[envName] ?? "";
  }
  return readString(record, ...keys);
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

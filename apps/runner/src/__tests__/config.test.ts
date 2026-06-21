import { describe, expect, it } from "vitest";
import { ValidationError } from "../errors/AppError.js";
import { loadRunnerConfig } from "../config/RunnerConfig.js";

describe("loadRunnerConfig", () => {
  it("loads validated config with defaults", () => {
    const config = loadRunnerConfig({
      BACKEND_BASE_URL: "http://localhost:8080/",
      RUNNER_TOKEN: "token",
    });

    expect(config.backendBaseUrl).toBe("http://localhost:8080");
    expect(config.redisUrl).toBe("redis://localhost:6379");
    expect(config.redisStreamKey).toBe("run:jobs");
    expect(config.maxConcurrency).toBe(3);
  });

  it("rejects invalid numeric config", () => {
    expect(() =>
      loadRunnerConfig({
        BACKEND_BASE_URL: "http://localhost:8080",
        RUNNER_TOKEN: "token",
        RUNNER_RESULT_BATCH_SIZE: "0",
      }),
    ).toThrow(ValidationError);
  });
});

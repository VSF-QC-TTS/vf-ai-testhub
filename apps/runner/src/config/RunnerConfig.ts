import { ValidationError } from "../errors/AppError.js";

export interface RunnerConfig {
  readonly redisUrl: string;
  readonly redisStreamKey: string;
  readonly redisConsumerGroup: string;
  readonly redisConsumerName: string;
  readonly backendBaseUrl: string;
  readonly runnerToken: string;
  readonly maxConcurrency: number;
  readonly pollBlockMs: number;
  readonly resultBatchSize: number;
  readonly resultFlushIntervalMs: number;
  readonly artifactDir: string;
}

export function loadRunnerConfig(env: NodeJS.ProcessEnv = process.env): RunnerConfig {
  return {
    redisUrl: required(env, "REDIS_URL", "redis://localhost:6379"),
    redisStreamKey: required(env, "REDIS_STREAM_KEY", "run:jobs"),
    redisConsumerGroup: required(env, "REDIS_CONSUMER_GROUP", "vf-ai-testhub-runner"),
    redisConsumerName: required(env, "REDIS_CONSUMER_NAME", `runner-${process.pid}`),
    backendBaseUrl: normalizeBaseUrl(required(env, "BACKEND_BASE_URL")),
    runnerToken: required(env, "RUNNER_TOKEN"),
    maxConcurrency: positiveInt(env.RUNNER_MAX_CONCURRENCY, 3, "RUNNER_MAX_CONCURRENCY"),
    pollBlockMs: positiveInt(env.RUNNER_POLL_BLOCK_MS, 5000, "RUNNER_POLL_BLOCK_MS"),
    resultBatchSize: positiveInt(env.RUNNER_RESULT_BATCH_SIZE, 50, "RUNNER_RESULT_BATCH_SIZE"),
    resultFlushIntervalMs: positiveInt(
      env.RUNNER_RESULT_FLUSH_INTERVAL_MS,
      2000,
      "RUNNER_RESULT_FLUSH_INTERVAL_MS",
    ),
    artifactDir: required(env, "RUNNER_ARTIFACT_DIR", "./artifacts"),
  };
}

function required(env: NodeJS.ProcessEnv, key: string, fallback?: string): string {
  const value = env[key] ?? fallback;
  if (value === undefined || value.trim().length === 0) {
    throw new ValidationError(`${key} is required`);
  }
  return value.trim();
}

function positiveInt(value: string | undefined, fallback: number, key: string): number {
  if (value === undefined || value.trim().length === 0) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${key} must be a positive integer`);
  }
  return parsed;
}

function normalizeBaseUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    throw new ValidationError("BACKEND_BASE_URL must be a valid URL", error);
  }
}

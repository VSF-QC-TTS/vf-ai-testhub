import { Redis } from "ioredis";
import { BackendClient } from "./clients/BackendClient.js";
import { TargetExecutor } from "./clients/TargetExecutor.js";
import { loadRunnerConfig } from "./config/RunnerConfig.js";
import { RunJobHandler } from "./jobs/RunJobHandler.js";
import { ResponseNormalizer } from "./normalizers/ResponseNormalizer.js";
import { RunStreamConsumer } from "./queue/RunStreamConsumer.js";
import { ResultReporter } from "./reporting/ResultReporter.js";

const config = loadRunnerConfig();
const redis = new Redis(config.redisUrl, { lazyConnect: true });
const backendClient = new BackendClient(config.backendBaseUrl, config.runnerToken);
const consumer = new RunStreamConsumer(
  redis,
  config.redisStreamKey,
  config.redisConsumerGroup,
  config.redisConsumerName,
  config.pollBlockMs,
);
const handler = new RunJobHandler(
  new TargetExecutor(),
  new ResponseNormalizer(),
  (runId) =>
    new ResultReporter(
      backendClient,
      runId,
      config.resultBatchSize,
      config.resultFlushIntervalMs,
    ),
);

let shuttingDown = false;

console.log(
  JSON.stringify({
    level: "info",
    message: "Runner configuration loaded",
    redisStreamKey: config.redisStreamKey,
    redisConsumerGroup: config.redisConsumerGroup,
    redisConsumerName: config.redisConsumerName,
    backendBaseUrl: config.backendBaseUrl,
  }),
);

process.once("SIGINT", requestShutdown);
process.once("SIGTERM", requestShutdown);

await redis.connect();
await consumer.ensureGroup();

while (!shuttingDown) {
  const message = await consumer.readOne();
  if (message === null) {
    continue;
  }
  try {
    await handler.handle(message.envelope);
    await consumer.ack(message.id);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Run job failed",
        redisMessageId: message.id,
        runId: message.envelope.runId,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }
}

redis.disconnect();

function requestShutdown(): void {
  shuttingDown = true;
}

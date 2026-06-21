import { loadRunnerConfig } from "./config/RunnerConfig.js";

const config = loadRunnerConfig();

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

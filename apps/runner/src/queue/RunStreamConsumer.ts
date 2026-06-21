import type { Redis } from "ioredis";
import { ExternalServiceError } from "../errors/AppError.js";
import { parseRunJobEnvelope } from "../contracts/guards.js";
import type { RunJobEnvelope } from "../types/RunSnapshot.js";

type RedisStreamReadResponse = Array<[string, Array<[string, string[]]>]>;

export interface RunStreamMessage {
  readonly id: string;
  readonly envelope: RunJobEnvelope;
}

export class RunStreamConsumer {
  public constructor(
    private readonly redis: Redis,
    private readonly streamKey: string,
    private readonly consumerGroup: string,
    private readonly consumerName: string,
    private readonly blockMs: number,
  ) {}

  public async ensureGroup(): Promise<void> {
    try {
      await this.redis.xgroup("CREATE", this.streamKey, this.consumerGroup, "$", "MKSTREAM");
    } catch (error) {
      if (error instanceof Error && error.message.includes("BUSYGROUP")) {
        return;
      }
      throw new ExternalServiceError("REDIS_GROUP_CREATE_FAILED", "Failed to create Redis consumer group", error);
    }
  }

  public async readOne(): Promise<RunStreamMessage | null> {
    const response = (await this.redis.xreadgroup(
      "GROUP",
      this.consumerGroup,
      this.consumerName,
      "COUNT",
      1,
      "BLOCK",
      this.blockMs,
      "STREAMS",
      this.streamKey,
      ">",
    )) as unknown as RedisStreamReadResponse | null;
    const stream = response?.[0];
    const message = stream?.[1]?.[0];
    if (message === undefined) {
      return null;
    }
    const [id, fields] = message;
    const payload = extractPayload(fields);
    return {
      id,
      envelope: parseRunJobEnvelope(payload),
    };
  }

  public async ack(messageId: string): Promise<void> {
    await this.redis.xack(this.streamKey, this.consumerGroup, messageId);
  }
}

function extractPayload(fields: string[]): string {
  for (let index = 0; index < fields.length; index += 2) {
    if (fields[index] === "payload") {
      const value = fields[index + 1];
      if (value !== undefined) {
        return value;
      }
    }
  }
  throw new ExternalServiceError("REDIS_MESSAGE_INVALID", "Redis stream message is missing payload", undefined, false);
}

import type { BackendClient } from "../clients/BackendClient.js";
import type { TestResultIngestionItem } from "../types/ResultPayload.js";

export class ResultReporter {
  private readonly buffer: TestResultIngestionItem[] = [];
  private timer: NodeJS.Timeout | undefined;

  public constructor(
    private readonly backendClient: BackendClient,
    private readonly runId: string,
    private readonly batchSize: number,
    private readonly flushIntervalMs: number,
  ) {}

  public start(): void {
    this.timer = setInterval(() => {
      void this.flush(false);
    }, this.flushIntervalMs);
    this.timer.unref();
  }

  public async add(result: TestResultIngestionItem): Promise<void> {
    this.buffer.push(result);
    if (this.buffer.length >= this.batchSize) {
      await this.flush(false);
    }
  }

  public async finish(): Promise<void> {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    await this.flush(true);
  }

  public async flush(finalBatch: boolean): Promise<void> {
    if (this.buffer.length === 0 && !finalBatch) {
      return;
    }
    const batch = this.buffer.splice(0, this.buffer.length);
    await this.backendClient.submitRunResults(this.runId, {
      finalBatch,
      testResults: batch,
    });
  }
}

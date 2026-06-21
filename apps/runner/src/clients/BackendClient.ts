import { ExternalServiceError } from "../errors/AppError.js";
import type { ResultIngestionRequest } from "../types/ResultPayload.js";
import { assertResultIngestionRequest } from "../contracts/guards.js";

export class BackendClient {
  public constructor(
    private readonly baseUrl: string,
    private readonly runnerToken: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  public async submitRunResults(runId: string, payload: ResultIngestionRequest): Promise<void> {
    assertResultIngestionRequest(payload);
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/internal/runs/${runId}/results`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-runner-token": this.runnerToken,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const retryable = response.status >= 500 || response.status === 429;
      throw new ExternalServiceError(
        "BACKEND_RESULT_SUBMIT_FAILED",
        `Backend result submit failed with status ${response.status}`,
        undefined,
        retryable,
      );
    }
  }
}

export class AppError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    options?: { readonly cause?: unknown; readonly retryable?: boolean },
  ) {
    super(message, { cause: options?.cause });
    this.name = "AppError";
    this.retryable = options?.retryable ?? false;
  }

  public readonly retryable: boolean;
}

export class ValidationError extends AppError {
  public constructor(message: string, cause?: unknown) {
    super("VALIDATION_ERROR", message, { cause, retryable: false });
    this.name = "ValidationError";
  }
}

export class ExternalServiceError extends AppError {
  public constructor(code: string, message: string, cause?: unknown, retryable = true) {
    super(code, message, { cause, retryable });
    this.name = "ExternalServiceError";
  }
}

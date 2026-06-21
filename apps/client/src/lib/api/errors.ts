import { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, string>;
  public type?: string;

  constructor(message: string, status: number, data?: ApiErrorResponse) {
    super(data?.detail || message);
    this.name = "ApiError";
    this.status = status;
    this.code = data?.code;
    this.details = data?.errors;
    this.type = data?.type;
  }
}

export type UUID = string;

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export type ReviewStatus = "PASSED" | "FAILED" | "UNCERTAIN" | "ERROR" | "SKIPPED";
export type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type UserStatus = "PENDING_EMAIL_VERIFICATION" | "ACTIVE" | "DISABLED";
export type Role = "QC_MEMBER" | "QC_LEAD" | "ADMIN";

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  errors?: Record<string, string>;
}

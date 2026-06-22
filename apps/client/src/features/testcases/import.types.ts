export interface ImportSampleRow {
  row: number;
  data: Record<string, unknown>;
}

export interface ImportRowError {
  row: number;
  reason: string;
}

export interface ImportPreviewResponse {
  previewId: string;
  fileName: string;
  totalRows: number;
  detectedColumns: string[];
  suggestedMapping: Record<string, string>;
  sampleRows: ImportSampleRow[];
  duplicateCount: number;
  duplicateExternalIds: string[];
  expiresAt: string;
}

export interface ConfirmTestCaseImportRequest {
  previewId: string;
  columnMapping?: Record<string, string>;
  skipDuplicates?: boolean;
  defaultTags?: string[];
}

export interface ImportConfirmResponse {
  previewId: string;
  datasetPublicId: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportRowError[];
  createdAt: string;
}

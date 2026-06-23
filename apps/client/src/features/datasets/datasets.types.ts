export interface DatasetResponse {
  publicId: string;
  projectPublicId: string;
  archived: boolean;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  testCaseCount?: number;
  creator?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetCreateRequest {
  projectId: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface DatasetUpdateRequest {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

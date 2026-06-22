export interface DatasetResponse {
  publicId: string;
  projectId: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
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
}

export interface DatasetUpdateRequest {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
}

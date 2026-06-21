import type { UUID } from "../../lib/api/types";
import type { UserResponse } from "../auth/auth.types";

export interface ProjectResponse {
  id: UUID;
  name: string;
  description: string | null;
  owner: UserResponse;
  createdBy: UserResponse;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string | null;
}

import type { Role, UserStatus } from "../../lib/api/types";

export interface UserResponse {
  publicId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  displayName?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

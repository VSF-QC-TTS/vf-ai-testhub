import { apiClient } from "../../lib/api/client";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UserResponse,
} from "./auth.types";

const AUTH_URL = "/api/v1/auth";
const USERS_URL = "/api/v1/users";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>(`${AUTH_URL}/login`, data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>(`${AUTH_URL}/register`, data);
    return res.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>(`${AUTH_URL}/refresh-token`);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${AUTH_URL}/logout`);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>(`${AUTH_URL}/verify-email`, data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(`${AUTH_URL}/forgot-password`, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(`${AUTH_URL}/reset-password`, data);
  },

  getMe: async (): Promise<UserResponse> => {
    const res = await apiClient.get<UserResponse>(`${USERS_URL}/me`);
    return res.data;
  },
};

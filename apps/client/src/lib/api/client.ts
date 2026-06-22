import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../env";
import { ApiError } from "./errors";
import { useAuthStore } from "../../features/auth/auth.store";
import i18n from "../i18n";
import type { ApiErrorResponse, Role, UserStatus } from "./types";

interface AuthRetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: {
    publicId: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: Role;
    status: UserStatus;
    lastLoginAt: string | null;
  };
}

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true, // For refresh cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<RefreshResponse> | null = null;

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (i18n.language && config.headers) {
    config.headers["Accept-Language"] = i18n.language;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const originalConfig = error.config as AuthRetryConfig | undefined;
      
      if (
        status === 401 &&
        originalConfig &&
        !originalConfig._retry &&
        !isAuthEndpoint(originalConfig.url)
      ) {
        originalConfig._retry = true;

        try {
          const refreshData = await refreshSession();
          useAuthStore.getState().setSession(refreshData.accessToken, refreshData.user);
          originalConfig.headers.Authorization = `Bearer ${refreshData.accessToken}`;
          return apiClient.request(originalConfig);
        } catch {
          useAuthStore.getState().clearSession();
          redirectToLogin();
        }
      }

      throw new ApiError(error.message, status, data);
    }
    
    // Network errors
    throw new ApiError(error.message, 0);
  }
);

function isAuthEndpoint(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/api/v1/auth/");
}

function redirectToLogin(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function refreshSession(): Promise<RefreshResponse> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<RefreshResponse>("/api/v1/auth/refresh-token")
      .then((response) => response.data)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

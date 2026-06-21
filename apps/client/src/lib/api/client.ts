import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "../env";
import { ApiError } from "./errors";
import { useAuthStore } from "../../features/auth/auth.store";
import i18n from "../i18n";
import { ApiErrorResponse } from "./types";

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true, // For refresh cookies
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401
      if (status === 401) {
        useAuthStore.getState().clearSession();
        // Option to redirect to login:
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      throw new ApiError(error.message, status, data);
    }
    
    // Network errors
    throw new ApiError(error.message, 0);
  }
);

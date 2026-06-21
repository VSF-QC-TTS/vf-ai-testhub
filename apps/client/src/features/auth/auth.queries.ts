import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { useAuthStore } from "./auth.store";
import type { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  VerifyEmailRequest 
} from "./auth.types";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => ["auth", "session"] as const,
    me: () => ["auth", "me"] as const,
  },
};

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  
  return useMutation({
    mutationFn: (data: VerifyEmailRequest) => authApi.verifyEmail(data),
    onSuccess: (user) => {
      if (accessToken) {
        setSession(accessToken, user);
      }
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getMe(),
    // Only fetch if we have a token or we're actively bootstrapping
    enabled: !!useAuthStore.getState().accessToken,
  });
}

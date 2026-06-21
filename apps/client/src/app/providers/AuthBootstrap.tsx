import { useEffect, useState } from "react";
import { useAuthStore } from "../../features/auth/auth.store";
import { authApi } from "../../features/auth/auth.api";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // Attempt to refresh token using HttpOnly cookie
        const data = await authApi.refreshToken();
        if (mounted && data.accessToken) {
          // Success: Set session.
          // Note: getMe is not strictly needed here if refreshToken already returns the user
          // which in our API it does (LoginResponse includes UserResponse).
          setSession(data.accessToken, data.user);
        }
      } catch (e) {
        // Refresh failed (no cookie, expired cookie, etc)
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("auth:bootstrapping", "Initializing session...")}</p>
      </div>
    );
  }

  return <>{children}</>;
}

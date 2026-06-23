import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { getLoginSchema, type LoginFormData } from "../auth.schemas";
import { useLogin } from "../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { Loader2 } from "lucide-react";

type OAuthProvider = "google" | "github";

export function buildOAuthAuthorizationUrl(provider: OAuthProvider, redirectTo: string): string {
  const params = new URLSearchParams({ redirectTo });
  return `/api/v1/oauth2/authorization/${provider}?${params.toString()}`;
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema(t)),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigate(redirectTo, { replace: true });
      },
    });
  };

  const handleOAuthLogin = (provider: OAuthProvider) => {
    window.location.href = buildOAuthAuthorizationUrl(provider, redirectTo);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("auth:login.title", "Welcome back")}
        </h2>
        <p className="text-base text-muted-foreground mt-2">
          {t("auth:login.description", "Sign in to your account to continue")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-5">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:login.email", "Email")}
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <FloatingInput
              label={t("auth:login.password", "Mật khẩu")}
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-2 mb-4">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("auth:login.forgotPassword", "Forgot password?")}
          </Link>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
          >
            {error instanceof ApiError && error.code 
              ? t(`api:${error.code}`, { defaultValue: t("auth:login.error", "Failed to sign in") as string }) 
              : t("auth:login.error", "Failed to sign in")}
          </motion.div>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 text-base active:scale-[0.98] transition-all" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("auth:login.submit", "Sign in")}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">
            {t("auth:login.orContinueWith", "Or continue with")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          type="button" 
          className="h-11 active:scale-[0.98] transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => handleOAuthLogin('github')}
        >
          <GitHubLogoIcon className="mr-2 h-4 w-4" />
          {t("auth:login.oauth.github", "GitHub")}
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          className="h-11 active:scale-[0.98] transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => handleOAuthLogin('google')}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t("auth:login.oauth.google", "Google")}
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        {t("auth:login.noAccount", "Don't have an account? ")}
        <Link to="/register" className="font-medium text-foreground hover:underline underline-offset-4">
          {t("auth:login.register", "Sign up")}
        </Link>
      </div>
    </div>
  );
}

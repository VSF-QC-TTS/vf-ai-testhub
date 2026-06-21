import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginSchema, type LoginFormData } from "../../auth.schemas";
import { useLogin } from "../../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { Loader2, Github } from "lucide-react";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigate(redirectTo, { replace: true });
      },
    });
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    // Redirect to backend OAuth endpoint
    window.location.href = `/api/v1/oauth2/authorization/${provider}`;
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>{t("auth:login.title", "Welcome back")}</CardTitle>
        <CardDescription>
          {t("auth:login.description", "Sign in to your account to continue")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:login.email", "Email")}
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <FloatingInput
              label={t("auth:login.password", "Password")}
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error instanceof ApiError ? error.message : t("auth:login.error", "Failed to sign in")}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth:login.submit", "Sign in")}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t("auth:login.orContinueWith", "Or continue with")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" onClick={() => handleOAuthLogin('github')}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" type="button" onClick={() => handleOAuthLogin('google')}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t("auth:login.forgotPassword", "Forgot password?")}
        </Link>
        <div className="text-sm text-muted-foreground">
          {t("auth:login.noAccount", "Don't have an account? ")}
          <Link to="/register" className="text-primary hover:underline">
            {t("auth:login.register", "Sign up")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

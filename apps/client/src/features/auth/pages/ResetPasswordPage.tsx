import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../auth.schemas";
import { useResetPassword } from "../../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [success, setSuccess] = useState(false);
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({ token, newPassword: data.newPassword }, {
      onSuccess: () => {
        setSuccess(true);
      },
    });
  };

  if (!token) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-destructive">{t("auth:resetPassword.invalidLink", "Invalid Link")}</CardTitle>
          <CardDescription>
            {t("auth:resetPassword.invalidLinkDesc", "The password reset link is invalid or has expired.")}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/forgot-password" className="text-primary hover:underline">
            {t("auth:resetPassword.requestNew", "Request a new link")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">{t("auth:resetPassword.successTitle", "Password reset")}</CardTitle>
          <CardDescription className="text-center">
            {t("auth:resetPassword.successDesc", "Your password has been successfully reset. You can now log in with your new password.")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild className="w-full">
            <Link to="/login">{t("auth:resetPassword.toLogin", "Continue to log in")}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>{t("auth:resetPassword.title", "Set new password")}</CardTitle>
        <CardDescription>
          {t("auth:resetPassword.description", "Your new password must be at least 8 characters.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:resetPassword.newPassword", "New Password")}
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <FloatingInput
              label={t("auth:resetPassword.confirmPassword", "Confirm Password")}
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error instanceof ApiError ? error.message : t("auth:resetPassword.error", "Failed to reset password")}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth:resetPassword.submit", "Reset password")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

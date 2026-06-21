import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../../auth.schemas";
import { useForgotPassword } from "../../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        setSuccess(true);
      },
    });
  };

  if (success) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">{t("auth:forgotPassword.successTitle", "Check your email")}</CardTitle>
          <CardDescription className="text-center">
            {t("auth:forgotPassword.successDesc", "If an account exists with that email, we have sent a password reset link.")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("auth:forgotPassword.backToLogin", "Back to log in")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>{t("auth:forgotPassword.title", "Forgot password")}</CardTitle>
        <CardDescription>
          {t("auth:forgotPassword.description", "Enter your email address to get a reset link.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:forgotPassword.email", "Email")}
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error instanceof ApiError ? error.message : t("auth:forgotPassword.error", "Failed to process request")}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth:forgotPassword.submit", "Send reset link")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link to="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth:forgotPassword.backToLogin", "Back to log in")}
        </Link>
      </CardFooter>
    </Card>
  );
}

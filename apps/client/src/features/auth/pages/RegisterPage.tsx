import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormData } from "../../auth.schemas";
import { useRegister } from "../../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { Loader2 } from "lucide-react";

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { mutate: registerUser, isPending, error } = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data, {
      onSuccess: () => {
        // Assume registration returns a user in pending state and we can navigate to a success/verify email screen
        navigate("/login", { replace: true });
        // Or show a toast saying "Please check your email"
      },
    });
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>{t("auth:register.title", "Create an account")}</CardTitle>
        <CardDescription>
          {t("auth:register.description", "Enter your details to sign up")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:register.displayName", "Display Name (Optional)")}
              type="text"
              autoComplete="name"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <FloatingInput
              label={t("auth:register.email", "Email")}
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
              label={t("auth:register.password", "Password")}
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error instanceof ApiError ? error.message : t("auth:register.error", "Failed to register")}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth:register.submit", "Sign up")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          {t("auth:register.hasAccount", "Already have an account? ")}
          <Link to="/login" className="text-primary hover:underline">
            {t("auth:register.login", "Sign in")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getRegisterSchema, type RegisterFormData } from "../auth.schemas";
import { useRegister } from "../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { Loader2 } from "lucide-react";

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const registerSchema = getRegisterSchema(t);

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
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("auth:register.title", "Create an account")}
        </h2>
        <p className="text-base text-muted-foreground mt-2">
          {t("auth:register.description", "Enter your details to sign up")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-5">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:register.displayName", "Display Name")}
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.displayName}
              aria-describedby={errors.displayName ? "displayName-error" : undefined}
              {...register("displayName")}
            />
            {errors.displayName && (
              <p id="displayName-error" className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <FloatingInput
              label={t("auth:register.email", "Email")}
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
              label={t("auth:register.password", "Password")}
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <FloatingInput
              label={t("auth:register.confirmPassword", "Confirm Password")}
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
          >
            {error instanceof ApiError && error.code 
              ? t(`api:${error.code}`, { defaultValue: t("auth:register.error", "Failed to create account") as string }) 
              : t("auth:register.error", "Failed to create account")}
          </motion.div>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 text-base active:scale-[0.98] transition-all" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("auth:register.submit", "Sign up")}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        {t("auth:register.hasAccount", "Already have an account? ")}
        <Link to="/login" className="font-medium text-foreground hover:underline underline-offset-4">
          {t("auth:register.login", "Sign in")}
        </Link>
      </div>
    </div>
  );
}

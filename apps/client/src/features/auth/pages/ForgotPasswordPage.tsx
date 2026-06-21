import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getForgotPasswordSchema, type ForgotPasswordFormData } from "../auth.schemas";
import { useForgotPassword } from "../auth.queries";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const forgotPasswordSchema = getForgotPasswordSchema(t);

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
          {t("auth:forgotPassword.successTitle", "Check your email")}
        </h2>
        <p className="text-base text-muted-foreground mb-8 max-w-[40ch] mx-auto leading-relaxed">
          {t("auth:forgotPassword.successDesc", "If an account exists with that email, we have sent a password reset link.")}
        </p>
        
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-foreground hover:text-emerald-500 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth:forgotPassword.backToLogin", "Back to log in")}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("auth:forgotPassword.title", "Forgot password")}
        </h2>
        <p className="text-base text-muted-foreground mt-2">
          {t("auth:forgotPassword.description", "Enter your email address to get a reset link.")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-5">
          <div className="space-y-1">
            <FloatingInput
              label={t("auth:forgotPassword.email", "Email")}
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
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
          >
            {error instanceof ApiError && error.code 
              ? t(`api:${error.code}`, { defaultValue: t("auth:forgotPassword.error", "Failed to send reset link") as string }) 
              : t("auth:forgotPassword.error", "Failed to send reset link")}
          </motion.div>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 text-base active:scale-[0.98] transition-all" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("auth:forgotPassword.submit", "Send reset link")}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-foreground hover:text-emerald-500 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth:forgotPassword.backToLogin", "Back to log in")}
        </Link>
      </div>
    </div>
  );
}

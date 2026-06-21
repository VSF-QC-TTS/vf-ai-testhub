import { z } from "zod";
import type { TFunction } from "i18next";

export const getLoginSchema = (t: TFunction) => z.object({
  email: z.string().email(t("zod:errors.invalid_string.email")),
  password: z.string().min(8, t("zod:errors.too_small.string.inclusive", { minimum: 8 })),
});

export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;

export const getRegisterSchema = (t: TFunction) => z.object({
  email: z.string().email(t("zod:errors.invalid_string.email")),
  password: z.string().min(8, t("zod:errors.too_small.string.inclusive", { minimum: 8 })),
  confirmPassword: z.string().min(8, t("zod:errors.too_small.string.inclusive", { minimum: 8 })),
  displayName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("auth:register.passwordsDoNotMatch"), 
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>;

export const getForgotPasswordSchema = (t: TFunction) => z.object({
  email: z.string().email(t("zod:errors.invalid_string.email")),
});

export type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export const getResetPasswordSchema = (t: TFunction) => z.object({
  newPassword: z.string().min(8, t("zod:errors.too_small.string.inclusive", { minimum: 8 })),
  confirmPassword: z.string().min(8, t("zod:errors.too_small.string.inclusive", { minimum: 8 })),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t("auth:register.passwordsDoNotMatch"),
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>;

import { z } from "zod";
import type { TFunction } from "i18next";

export const getProjectSchema = (t: TFunction) => z.object({
  name: z.string().min(1, t("common:validation.required")).max(255, t("common:validation.maxLength", { max: 255 })),
  description: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<ReturnType<typeof getProjectSchema>>;

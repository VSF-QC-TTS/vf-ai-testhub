import { z } from "zod";
import type { TFunction } from "i18next";

export const getProjectSchema = (t: TFunction) => z.object({
  name: z.string().min(1, t("zod:errors.too_small.string.inclusive", { minimum: 1 })).max(255, t("zod:errors.too_big.string.inclusive", { maximum: 255 })),
  description: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<ReturnType<typeof getProjectSchema>>;

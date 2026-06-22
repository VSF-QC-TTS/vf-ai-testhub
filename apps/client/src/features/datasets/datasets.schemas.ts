import { z } from "zod";
import type { TFunction } from "i18next";

export const getDatasetSchema = (t: TFunction) => z.object({
  projectId: z.string().uuid(t("common:validation.invalidId")),
  name: z.string()
    .min(1, t("common:validation.required"))
    .max(255, t("common:validation.maxLength", { max: 255 })),
  description: z.string()
    .max(1000, t("common:validation.maxLength", { max: 1000 }))
    .optional(),
  category: z.string()
    .max(100, t("common:validation.maxLength", { max: 100 }))
    .optional(),
  tags: z.array(z.string()).optional(),
});

export type DatasetFormData = z.infer<ReturnType<typeof getDatasetSchema>>;

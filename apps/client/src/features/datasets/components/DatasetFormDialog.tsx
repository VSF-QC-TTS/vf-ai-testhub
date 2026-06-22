import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/button";
import { getDatasetSchema, type DatasetFormData } from "../datasets.schemas";
import { useCreateDataset, useUpdateDataset } from "../datasets.queries";
import type { DatasetResponse } from "../datasets.types";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface DatasetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset?: DatasetResponse | null;
}

export function DatasetFormDialog({ open, onOpenChange, dataset }: DatasetFormDialogProps) {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();
  const isEditing = !!dataset;

  const createMutation = useCreateDataset();
  const updateMutation = useUpdateDataset(projectId, dataset?.publicId ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const form = useForm<DatasetFormData>({
    resolver: zodResolver(getDatasetSchema(t)),
    defaultValues: {
      projectId,
      name: "",
      description: "",
      category: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (dataset) {
        form.reset({
          projectId,
          name: dataset.name,
          description: dataset.description || "",
          category: dataset.category || "",
          tags: dataset.tags || [],
        });
      } else {
        form.reset({
          projectId,
          name: "",
          description: "",
          category: "",
          tags: [],
        });
      }
    }
  }, [open, dataset, form, projectId]);

  const onSubmit = (data: DatasetFormData) => {
    // Convert comma-separated string back to array if needed (though tags are array in schema, we might need to handle string input)
    // For now, assume tags are empty array as we don't have a dedicated tags input component yet
    const payload = {
      ...data,
      tags: data.tags || [],
    };

    if (isEditing) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common:actions.saveChanges"));
          onOpenChange(false);
        },
        onError: () => toast.error(t("common:error"))
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("common:actions.save"));
          onOpenChange(false);
        },
        onError: () => toast.error(t("common:error"))
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("datasets:form.editTitle") : t("datasets:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? "" : t("datasets:form.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("datasets:form.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("datasets:form.namePlaceholder")} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("datasets:form.category")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("datasets:form.categoryPlaceholder")} disabled={isPending} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("datasets:form.description")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("datasets:form.descPlaceholder")} disabled={isPending} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mutationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
              >
                {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
              </motion.div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t("common:actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[120px]">
                {isPending
                  ? t("common:loading")
                  : isEditing
                    ? t("common:actions.saveChanges")
                    : t("common:actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

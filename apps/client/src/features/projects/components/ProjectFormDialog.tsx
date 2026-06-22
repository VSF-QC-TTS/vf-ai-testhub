import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/button";
import { getProjectSchema, type ProjectFormData } from "../projects.schemas";
import { useCreateProject, useUpdateProject } from "../projects.queries";
import type { ProjectResponse } from "../projects.types";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectResponse | null;
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!project;
  
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(project?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(getProjectSchema(t)),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (project) {
        form.reset({
          name: project.name,
          description: project.description || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, project, form]);

  const onSubmit = (data: ProjectFormData) => {
    if (isEditing) {
      updateMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("projects:form.editTitle") : t("projects:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? "" : t("projects:form.createDesc")}
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
                    <FormLabel>{t("projects:form.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("projects:form.namePlaceholder")} disabled={isPending} {...field} />
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
                    <FormLabel>{t("projects:form.description")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("projects:form.descPlaceholder")} disabled={isPending} {...field} value={field.value || ""} />
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
                {t("projects:form.cancel")}
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[100px] relative overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ y: isPending ? -30 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <span className="flex h-[20px] items-center">{t("projects:form.submit")}</span>
                  <span className="flex h-[20px] items-center absolute top-[30px]">
                    {isEditing ? t("projects:form.updating") : t("projects:form.creating")}
                  </span>
                </motion.div>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

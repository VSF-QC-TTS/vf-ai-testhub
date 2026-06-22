import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRubricSchema, type CreateRubricDto, type UpdateRubricDto, type RubricSnapshotDto, RubricCategory, RubricScope } from "../rubrics.schemas";
import { useCreateRubric, useUpdateRubric } from "../rubrics.api";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface RubricFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rubric?: RubricSnapshotDto | null;
}

export function RubricFormDialog({ open, onOpenChange, rubric }: RubricFormDialogProps) {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const isEditing = !!rubric;
  
  const createMutation = useCreateRubric();
  const updateMutation = useUpdateRubric();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const form = useForm<CreateRubricDto>({
    resolver: zodResolver(createRubricSchema(t)),
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      language: "en",
      content: "",
      defaultThreshold: 0.8,
      scope: RubricScope.PROJECT,
    },
  });

  useEffect(() => {
    if (open) {
      if (rubric) {
        form.reset({
          name: rubric.name,
          description: rubric.description || "",
          category: rubric.category || undefined,
          language: rubric.language || "en",
          content: rubric.content,
          defaultThreshold: rubric.defaultThreshold ?? 0.8,
          scope: rubric.scope,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          category: undefined,
          language: "en",
          content: "",
          defaultThreshold: 0.8,
          scope: RubricScope.PROJECT,
        });
      }
    }
  }, [open, rubric, form]);

  const onSubmit = (data: CreateRubricDto) => {
    if (isEditing && rubric) {
      updateMutation.mutate({ rubricId: rubric.publicId, body: data as UpdateRubricDto }, {
        onSuccess: () => {
          toast.success(t("rubrics:form.messages.updated"));
          onOpenChange(false);
        },
        onError: () => toast.error(t("rubrics:form.messages.updateFailed"))
      });
    } else if (projectId) {
      createMutation.mutate({ projectId, body: data }, {
        onSuccess: () => {
          toast.success(t("rubrics:form.messages.created"));
          onOpenChange(false);
        },
        onError: () => toast.error(t("rubrics:form.messages.createFailed"))
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("rubrics:form.editTitle") : t("rubrics:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("rubrics:form.editDesc") : t("rubrics:form.createDesc")}
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
                    <FormLabel>{t("rubrics:form.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("rubrics:form.namePlaceholder")} disabled={isPending} {...field} />
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
                    <FormLabel>{t("rubrics:form.description")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("rubrics:form.descPlaceholder")} disabled={isPending} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("rubrics:form.category")}</FormLabel>
                      <Select disabled={isPending} onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("rubrics:form.categoryPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(RubricCategory).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {t(`rubrics:categories.${cat}`, { defaultValue: cat })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("rubrics:form.language")}</FormLabel>
                      <Select disabled={isPending} onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("rubrics:form.languagePlaceholder", "Chọn ngôn ngữ...")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="defaultThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rubrics:form.threshold")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="1" 
                        disabled={isPending} 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rubrics:form.content")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("rubrics:form.contentPlaceholder")} 
                        className="min-h-[150px] font-mono text-sm" 
                        disabled={isPending} 
                        {...field} 
                      />
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
              <Button type="submit" disabled={isPending} className="min-w-[100px]">
                {isEditing ? t("common:actions.saveChanges") : t("common:actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { getTestCaseSchema, type TestCaseFormData } from "../testcases.schemas";
import { useCreateTestCase, useUpdateTestCase } from "../testcases.queries";
import type { TestCaseResponse } from "../testcases.types";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";

interface TestCaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCase?: TestCaseResponse | null;
}

export function TestCaseFormDialog({ open, onOpenChange, testCase }: TestCaseFormDialogProps) {
  const { t } = useTranslation();
  const { datasetId = "" } = useParams();
  const isEditing = !!testCase;

  const createMutation = useCreateTestCase(datasetId);
  const updateMutation = useUpdateTestCase();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const [isValidatingJson, setIsValidatingJson] = useState(false);

  const form = useForm<TestCaseFormData>({
    resolver: zodResolver(getTestCaseSchema(t)),
    defaultValues: {
      externalId: "",
      sectionName: "",
      name: "",
      description: "",
      input: "",
      expectedBehavior: "",
      referenceAnswer: "",
      variablesString: "",
      preconditions: "",
      tags: "",
      priority: "P3",
      enabled: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (testCase) {
        form.reset({
          externalId: testCase.externalId || "",
          sectionName: testCase.sectionName || "",
          name: testCase.name || "",
          description: testCase.description || "",
          input: testCase.input || "",
          expectedBehavior: testCase.expectedBehavior || "",
          referenceAnswer: testCase.referenceAnswer || "",
          variablesString: testCase.variables ? JSON.stringify(testCase.variables, null, 2) : "",
          preconditions: testCase.preconditions || "",
          tags: testCase.tags ? testCase.tags.join(", ") : "",
          priority: testCase.priority || "P3",
          enabled: testCase.enabled,
          sortOrder: testCase.sortOrder || 0,
        });
      } else {
        form.reset({
          externalId: "",
          sectionName: "",
          name: "",
          description: "",
          input: "",
          expectedBehavior: "",
          referenceAnswer: "",
          variablesString: "",
          preconditions: "",
          tags: "",
          priority: "P3",
          enabled: true,
          sortOrder: 0,
        });
      }
    }
  }, [open, testCase, form]);

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      if (!window.confirm(t("testcases:form.messages.unsavedChanges"))) {
        return;
      }
    }
    onOpenChange(newOpen);
  };

  const handleFormatJson = () => {
    const val = form.getValues("variablesString");
    if (!val) return;
    try {
      const parsed = JSON.parse(val);
      form.setValue("variablesString", JSON.stringify(parsed, null, 2), { shouldValidate: true });
      setIsValidatingJson(true);
      setTimeout(() => setIsValidatingJson(false), 2000);
    } catch {
      form.setError("variablesString", { message: t("testcases:form.validation.invalidJson") });
    }
  };

  const onSubmit = (data: TestCaseFormData) => {
    let variables: Record<string, unknown> | undefined = undefined;
    if (data.variablesString) {
      try {
        variables = JSON.parse(data.variablesString);
      } catch {
        form.setError("variablesString", { message: t("testcases:form.validation.invalidJson") });
        return;
      }
    }

    const payload = {
      externalId: data.externalId,
      sectionName: data.sectionName,
      name: data.name,
      description: data.description,
      input: data.input,
      expectedBehavior: data.expectedBehavior,
      referenceAnswer: data.referenceAnswer,
      variables,
      preconditions: data.preconditions,
      tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      priority: data.priority,
      enabled: data.enabled,
      sortOrder: data.sortOrder,
    };

    if (isEditing) {
      updateMutation.mutate({ id: testCase.publicId, data: payload }, {
        onSuccess: () => {
          toast.success(t("testcases:form.messages.updated"));
          form.reset({}, { keepValues: true }); // Reset isDirty
          onOpenChange(false);
        },
        onError: () => toast.error(t("testcases:form.messages.updateFailed"))
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("testcases:form.messages.created"));
          form.reset({}, { keepValues: true }); // Reset isDirty
          onOpenChange(false);
        },
        onError: () => toast.error(t("testcases:form.messages.createFailed"))
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("testcases:form.editTitle") : t("testcases:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("testcases:form.editDesc") : t("testcases:form.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="externalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("testcases:form.externalId")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("testcases:form.externalIdPlaceholder")} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sectionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("testcases:form.section")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("testcases:form.sectionPlaceholder")} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("testcases:form.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("testcases:form.namePlaceholder")} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("testcases:form.input")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("testcases:form.inputPlaceholder")} className="min-h-[100px]" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedBehavior"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("testcases:form.expectedBehavior")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("testcases:form.expectedBehaviorPlaceholder")} className="min-h-[80px]" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceAnswer"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("testcases:form.referenceAnswer")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("testcases:form.referenceAnswerPlaceholder")} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="variablesString"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("testcases:form.variables")}</FormLabel>
                      <Button type="button" variant="ghost" size="sm" onClick={handleFormatJson} className="h-6 text-xs px-2">
                        {isValidatingJson ? <Check className="w-3 h-3 mr-1 text-green-500" /> : null}
                        {t("testcases:form.formatValidate")}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="{&#34;key&#34;: &#34;value&#34;}" className="font-mono text-sm min-h-[120px]" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("testcases:form.tags")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("testcases:form.tagsPlaceholder")} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 justify-end sm:flex-row sm:items-end">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("testcases:form.priority")}</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isPending}
                          {...field}
                        >
                          <option value="P0">P0</option>
                          <option value="P1">P1</option>
                          <option value="P2">P2</option>
                          <option value="P3">P3</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0 pb-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          disabled={isPending}
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal mb-0">{t("testcases:form.status")}</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
                {t("common:actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? t("common:actions.saveChanges") : t("common:actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

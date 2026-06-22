import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { getAssertionSchema, type AssertionFormData } from "../assertions.schemas";
import { useCreateAssertion, useUpdateAssertion } from "../assertions.queries";
import type { AssertionResponse, AssertionScope, AssertionType } from "../assertions.types";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface AssertionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assertion?: AssertionResponse | null;
  testCaseId: string;
}

const SCOPE_OPTIONS: { label: string; value: AssertionScope }[] = [
  { label: "Whole Response", value: "WHOLE_RESPONSE" },
  { label: "Field", value: "FIELD" },
  { label: "Multi-Field", value: "MULTI_FIELD" },
  { label: "Component", value: "COMPONENT" },
];

const TYPE_OPTIONS: { label: string; value: AssertionType }[] = [
  { label: "Equals", value: "equals" },
  { label: "Not Equals", value: "not_equals" },
  { label: "Contains", value: "contains" },
  { label: "Not Contains", value: "not_contains" },
  { label: "Regex", value: "regex" },
  { label: "Greater Than", value: "greater_than" },
  { label: "Less Than", value: "less_than" },
  { label: "Between", value: "between" },
  { label: "Is True", value: "is_true" },
  { label: "Is False", value: "is_false" },
  { label: "Field Exists", value: "field_exists" },
  { label: "Field Not Exists", value: "field_not_exists" },
  { label: "Array Contains", value: "array_contains" },
  { label: "Array Length >", value: "array_length_greater_than" },
  { label: "LLM Rubric", value: "llm_rubric" },
];

export function AssertionFormDialog({ open, onOpenChange, assertion, testCaseId }: AssertionFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!assertion;

  const createMutation = useCreateAssertion(testCaseId);
  const updateMutation = useUpdateAssertion();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const [isValidatingJson, setIsValidatingJson] = useState(false);

  const form = useForm<AssertionFormData>({
    resolver: zodResolver(getAssertionSchema(t)) as Resolver<AssertionFormData>,
    defaultValues: {
      scope: "WHOLE_RESPONSE",
      type: "contains",
      targetComponent: "",
      fieldPath: "",
      fieldPathsString: "",
      expectedValueString: "",
      rubricId: "",
      rubricOverride: "",
      threshold: 0.8,
      weight: 1.0,
      severity: "MAJOR",
      enabled: true,
      sortOrder: 0,
    },
  });

  const watchScope = useWatch({ control: form.control, name: "scope" });
  const watchType = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    if (open) {
      if (assertion) {
        form.reset({
          scope: assertion.scope,
          type: assertion.type,
          targetComponent: assertion.targetComponent || "",
          fieldPath: assertion.fieldPath || "",
          fieldPathsString: assertion.fieldPaths ? assertion.fieldPaths.join(", ") : "",
          expectedValueString: typeof assertion.expectedValue === "object" ? JSON.stringify(assertion.expectedValue, null, 2) : String(assertion.expectedValue || ""),
          rubricId: assertion.rubricPublicId || "",
          rubricOverride: assertion.rubricOverride || "",
          threshold: assertion.threshold || 0.8,
          weight: assertion.weight || 1.0,
          severity: assertion.severity || "MAJOR",
          enabled: assertion.enabled,
          sortOrder: assertion.sortOrder || 0,
        });
      } else {
        form.reset({
          scope: "WHOLE_RESPONSE",
          type: "contains",
          targetComponent: "",
          fieldPath: "",
          fieldPathsString: "",
          expectedValueString: "",
          rubricId: "",
          rubricOverride: "",
          threshold: 0.8,
          weight: 1.0,
          severity: "MAJOR",
          enabled: true,
          sortOrder: 0,
        });
      }
    }
  }, [open, assertion, form]);

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      if (!window.confirm(t("assertions:form.messages.unsavedChanges"))) {
        return;
      }
    }
    onOpenChange(newOpen);
  };

  const handleFormatExpectedJson = () => {
    const val = form.getValues("expectedValueString");
    if (!val) return;
    try {
      const parsed = JSON.parse(val);
      form.setValue("expectedValueString", JSON.stringify(parsed, null, 2), { shouldValidate: true });
      setIsValidatingJson(true);
      setTimeout(() => setIsValidatingJson(false), 2000);
    } catch {
      // It might just be a normal string, ignore.
    }
  };

  const onSubmit = (data: AssertionFormData) => {
    let expectedValue: unknown = data.expectedValueString;
    if (data.expectedValueString && (data.expectedValueString.startsWith("{") || data.expectedValueString.startsWith("["))) {
      try {
        expectedValue = JSON.parse(data.expectedValueString);
      } catch {
        // Fallback to string if parsing fails, or we could throw an error.
      }
    }
    // Parse boolean if applicable
    if (data.expectedValueString === "true") expectedValue = true;
    if (data.expectedValueString === "false") expectedValue = false;
    // Parse number if applicable
    if (data.expectedValueString && !isNaN(Number(data.expectedValueString))) {
      expectedValue = Number(data.expectedValueString);
    }

    const payload = {
      scope: data.scope,
      type: data.type,
      targetComponent: data.targetComponent || undefined,
      fieldPath: data.scope === "FIELD" ? data.fieldPath : undefined,
      fieldPaths: data.scope === "MULTI_FIELD" && data.fieldPathsString ? data.fieldPathsString.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      expectedValue,
      rubricId: data.type === "llm_rubric" ? data.rubricId : undefined,
      rubricOverride: data.type === "llm_rubric" ? data.rubricOverride : undefined,
      threshold: data.type === "llm_rubric" ? data.threshold : undefined,
      weight: data.weight,
      severity: data.severity,
      enabled: data.enabled,
      sortOrder: data.sortOrder,
    };

    if (isEditing) {
      updateMutation.mutate({ id: assertion.publicId, data: payload }, {
        onSuccess: () => {
          toast.success(t("assertions:form.messages.updated"));
          form.reset({}, { keepValues: true });
          onOpenChange(false);
        },
        onError: () => toast.error(t("assertions:form.messages.updateFailed"))
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("assertions:form.messages.created"));
          form.reset({}, { keepValues: true });
          onOpenChange(false);
        },
        onError: () => toast.error(t("assertions:form.messages.createFailed"))
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("assertions:form.editTitle") : t("assertions:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("assertions:form.editDesc") : t("assertions:form.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("assertions:form.scope")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SCOPE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("assertions:form.type")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchScope === "FIELD" && (
                <FormField
                  control={form.control}
                  name="fieldPath"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("assertions:form.fieldPath")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("assertions:form.fieldPathPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">{t("assertions:form.fieldPathHint")}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchScope === "MULTI_FIELD" && (
                <FormField
                  control={form.control}
                  name="fieldPathsString"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("assertions:form.fieldPaths")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("assertions:form.fieldPathsPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchScope === "COMPONENT" && (
                <FormField
                  control={form.control}
                  name="targetComponent"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("assertions:form.targetComponent")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("assertions:form.targetComponentPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchType !== "llm_rubric" && watchType !== "field_exists" && watchType !== "field_not_exists" && watchType !== "is_true" && watchType !== "is_false" && (
                <FormField
                  control={form.control}
                  name="expectedValueString"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("assertions:form.expectedValue")}</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={handleFormatExpectedJson} className="h-6 text-xs px-2">
                          {isValidatingJson ? <Check className="w-3 h-3 mr-1 text-green-500" /> : null}
                          {t("assertions:form.formatJson")}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder={t("assertions:form.expectedValuePlaceholder")} className="min-h-[80px] font-mono text-sm" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchType === "llm_rubric" && (
                <>
                  <FormField
                    control={form.control}
                    name="rubricId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t("assertions:form.rubricId")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("assertions:form.rubricIdPlaceholder")} disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rubricOverride"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t("assertions:form.rubricOverride")}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("assertions:form.rubricOverridePlaceholder")} className="min-h-[80px]" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("assertions:form.threshold")}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" max="1" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("assertions:form.severity")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                        <SelectItem value="MAJOR">MAJOR</SelectItem>
                        <SelectItem value="MINOR">MINOR</SelectItem>
                        <SelectItem value="INFO">INFO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("assertions:form.weight")}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0.0001" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 pt-8">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        disabled={isPending}
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal mb-0">{t("assertions:form.enabled")}</FormLabel>
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

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
                {t("common:actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? t("common:actions.saveChanges") : t("common:actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

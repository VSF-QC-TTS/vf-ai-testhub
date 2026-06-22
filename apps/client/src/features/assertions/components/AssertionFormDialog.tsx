import { useEffect } from "react";
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
import { CheckCircle2, CircleDot, Info } from "lucide-react";
import {
  ASSERTION_GROUPS,
  ASSERTION_TYPE_META,
  buildAssertionSummary,
  extractBetweenRange,
  getAssertionGroup,
  getAssertionTypesForGroup,
  inferArrayValueMode,
  parseAssertionExpectedValue,
  stringifyEditableExpectedValue,
  type AssertionGroup,
  type ArrayValueMode,
} from "../assertions.ui";
import { cn } from "@/lib/utils";

interface AssertionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assertion?: AssertionResponse | null;
  testCaseId: string;
}

const SCOPE_OPTIONS: readonly {
  labelKey: string;
  fallbackLabel: string;
  descriptionKey: string;
  fallbackDescription: string;
  value: AssertionScope;
}[] = [
  {
    labelKey: "assertions:scopes.WHOLE_RESPONSE",
    fallbackLabel: "Whole response",
    descriptionKey: "assertions:scopeDescriptions.WHOLE_RESPONSE",
    fallbackDescription: "Check the whole raw response.",
    value: "WHOLE_RESPONSE",
  },
  {
    labelKey: "assertions:scopes.FIELD",
    fallbackLabel: "Field path",
    descriptionKey: "assertions:scopeDescriptions.FIELD",
    fallbackDescription: "Check one JSONPath field, e.g. $.data.answer.",
    value: "FIELD",
  },
  {
    labelKey: "assertions:scopes.COMPONENT",
    fallbackLabel: "Component",
    descriptionKey: "assertions:scopeDescriptions.COMPONENT",
    fallbackDescription: "Check an extracted component such as answer or intent.",
    value: "COMPONENT",
  },
  {
    labelKey: "assertions:scopes.MULTI_FIELD",
    fallbackLabel: "Multi-field",
    descriptionKey: "assertions:scopeDescriptions.MULTI_FIELD",
    fallbackDescription: "Use several fields together, mostly for LLM rubric checks.",
    value: "MULTI_FIELD",
  },
];

const ARRAY_VALUE_MODES: readonly { value: ArrayValueMode; labelKey: string; fallbackLabel: string }[] = [
  { value: "text", labelKey: "assertions:arrayValueModes.text", fallbackLabel: "Text" },
  { value: "number", labelKey: "assertions:arrayValueModes.number", fallbackLabel: "Number" },
  { value: "boolean", labelKey: "assertions:arrayValueModes.boolean", fallbackLabel: "True / false" },
  { value: "json", labelKey: "assertions:arrayValueModes.json", fallbackLabel: "JSON object / array" },
];

const defaultValues: AssertionFormData = {
  scope: "FIELD",
  type: "contains",
  targetComponent: "",
  fieldPath: "",
  fieldPathsString: "",
  expectedValueString: "",
  expectedNumber: undefined,
  betweenMin: undefined,
  betweenMax: undefined,
  arrayValueMode: "text",
  rubricId: "",
  rubricOverride: "",
  threshold: 0.8,
  weight: 1.0,
  severity: "MAJOR",
  enabled: true,
  sortOrder: 0,
};

export function AssertionFormDialog({ open, onOpenChange, assertion, testCaseId }: AssertionFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!assertion;

  const createMutation = useCreateAssertion(testCaseId);
  const updateMutation = useUpdateAssertion();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const form = useForm<AssertionFormData>({
    resolver: zodResolver(getAssertionSchema(t)) as Resolver<AssertionFormData>,
    defaultValues,
  });

  const watchScope = useWatch({ control: form.control, name: "scope" });
  const watchType = useWatch({ control: form.control, name: "type" });
  const watchArrayValueMode = useWatch({ control: form.control, name: "arrayValueMode" });
  const selectedGroup = getAssertionGroup(watchType);
  const availableTypes = getAssertionTypesForGroup(selectedGroup);
  const selectedTypeMeta = ASSERTION_TYPE_META[watchType];

  useEffect(() => {
    if (!open) {
      return;
    }

    if (assertion) {
      const range = extractBetweenRange(assertion.expectedValue);
      const expectedNumber = numericExpectedValue(assertion);
      form.reset({
        scope: assertion.scope,
        type: assertion.type,
        targetComponent: assertion.targetComponent || "",
        fieldPath: assertion.fieldPath || "",
        fieldPathsString: assertion.fieldPaths ? assertion.fieldPaths.join(", ") : "",
        expectedValueString: stringifyEditableExpectedValue(assertion.expectedValue),
        expectedNumber,
        betweenMin: range.min,
        betweenMax: range.max,
        arrayValueMode: assertion.type === "array_contains" ? inferArrayValueMode(assertion.expectedValue) : "text",
        rubricId: assertion.rubricPublicId || "",
        rubricOverride: assertion.rubricOverride || "",
        threshold: assertion.threshold || 0.8,
        weight: assertion.weight || 1.0,
        severity: assertion.severity || "MAJOR",
        enabled: assertion.enabled,
        sortOrder: assertion.sortOrder || 0,
      });
      return;
    }

    form.reset(defaultValues);
  }, [open, assertion, form]);

  const handleClose = (newOpen: boolean): void => {
    if (!newOpen && form.formState.isDirty) {
      if (!window.confirm(t("assertions:form.messages.unsavedChanges"))) {
        return;
      }
    }
    onOpenChange(newOpen);
  };

  const handleScopeChange = (scope: AssertionScope): void => {
    form.setValue("scope", scope, { shouldDirty: true, shouldValidate: true });
  };

  const handleGroupChange = (group: AssertionGroup): void => {
    const [firstType] = getAssertionTypesForGroup(group);
    if (firstType) {
      form.setValue("type", firstType, { shouldDirty: true, shouldValidate: true });
    }
  };

  const onSubmit = (data: AssertionFormData): void => {
    const expectedValue = parseAssertionExpectedValue(data);
    const payload = {
      scope: data.scope,
      type: data.type,
      targetComponent: data.scope === "COMPONENT" ? data.targetComponent?.trim() || undefined : undefined,
      fieldPath: data.scope === "FIELD" ? data.fieldPath?.trim() || undefined : undefined,
      fieldPaths: data.scope === "MULTI_FIELD" && data.fieldPathsString
        ? data.fieldPathsString.split(",").map(path => path.trim()).filter(Boolean)
        : undefined,
      expectedValue,
      rubricId: data.type === "llm_rubric" ? data.rubricId?.trim() || undefined : undefined,
      rubricOverride: data.type === "llm_rubric" ? data.rubricOverride?.trim() || undefined : undefined,
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
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("assertions:form.messages.created"));
        form.reset({}, { keepValues: true });
        onOpenChange(false);
      },
      onError: () => toast.error(t("assertions:form.messages.createFailed"))
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("assertions:form.editTitle") : t("assertions:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("assertions:form.editDesc") : t("assertions:form.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-3">
              <StepTitle number="1" title={t("assertions:form.steps.scope", "Choose where to check")} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SCOPE_OPTIONS.map((option) => {
                  const isSelected = watchScope === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleScopeChange(option.value)}
                      className={cn(
                        "min-h-[92px] rounded-lg border p-4 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border bg-background hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {isSelected ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> : <CircleDot className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{t(option.labelKey, option.fallbackLabel)}</div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">{t(option.descriptionKey, option.fallbackDescription)}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {watchScope === "FIELD" ? (
                <FormField
                  control={form.control}
                  name="fieldPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assertions:form.fieldPath")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("assertions:form.fieldPathPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">{t("assertions:form.fieldPathHint")}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {watchScope === "MULTI_FIELD" ? (
                <FormField
                  control={form.control}
                  name="fieldPathsString"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assertions:form.fieldPaths")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("assertions:form.fieldPathsPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {watchScope === "COMPONENT" ? (
                <FormField
                  control={form.control}
                  name="targetComponent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assertions:form.targetComponent")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("assertions:form.targetComponentPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </section>

            <section className="space-y-3">
              <StepTitle number="2" title={t("assertions:form.steps.condition", "Choose the condition")} />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {ASSERTION_GROUPS.map((group) => {
                  const isSelected = selectedGroup === group.value;
                  return (
                    <button
                      key={group.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleGroupChange(group.value)}
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background hover:bg-muted/40"
                      )}
                    >
                      <span className="font-medium">{t(group.labelKey, group.fallbackLabel)}</span>
                      <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                        {t(group.descriptionKey, group.fallbackDescription)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {availableTypes.map(type => {
                            const meta = ASSERTION_TYPE_META[type];
                            return (
                              <SelectItem key={type} value={type}>
                                {t(meta.labelKey, meta.fallbackLabel)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Info className="h-4 w-4" />
                    {t(selectedTypeMeta.labelKey, selectedTypeMeta.fallbackLabel)}
                  </div>
                  <p className="mt-1 text-xs leading-5">
                    {t(selectedTypeMeta.descriptionKey, selectedTypeMeta.fallbackDescription)}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <StepTitle number="3" title={t("assertions:form.steps.expected", "Enter the expected value")} />
              <ExpectedValueFields
                control={form.control}
                isPending={isPending}
                type={watchType}
                arrayValueMode={watchArrayValueMode}
              />
            </section>

            <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="text-sm font-medium">{t("assertions:form.scoringTitle", "Priority and scoring")}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </section>

            {assertion ? (
              <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t("assertions:form.currentSummary", "Current summary")}:</span>{" "}
                {buildAssertionSummary(t, assertion)}
              </div>
            ) : null}

            {mutationError ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
              >
                {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
              </motion.div>
            ) : null}

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

function StepTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function ExpectedValueFields({
  control,
  isPending,
  type,
  arrayValueMode,
}: {
  control: ReturnType<typeof useForm<AssertionFormData>>["control"];
  isPending: boolean;
  type: AssertionType;
  arrayValueMode: ArrayValueMode | undefined;
}) {
  const { t } = useTranslation();

  if (type === "llm_rubric") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
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
          control={control}
          name="rubricOverride"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{t("assertions:form.rubricOverride")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("assertions:form.rubricOverridePlaceholder")} className="min-h-[90px]" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
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
      </div>
    );
  }

  if (type === "is_true" || type === "is_false" || type === "field_exists" || type === "field_not_exists") {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        {t("assertions:form.noExpectedValueNeeded", "No expected value is needed for this condition. The runner checks the selected target directly.")}
      </div>
    );
  }

  if (type === "greater_than" || type === "less_than" || type === "array_length_greater_than") {
    return (
      <FormField
        control={control}
        name="expectedNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("assertions:form.expectedNumber", "Expected number")}</FormLabel>
            <FormControl>
              <Input type="number" step="any" placeholder="80" disabled={isPending} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (type === "between") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="betweenMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("assertions:form.minValue", "Minimum value")}</FormLabel>
              <FormControl>
                <Input type="number" step="any" placeholder="0" disabled={isPending} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="betweenMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("assertions:form.maxValue", "Maximum value")}</FormLabel>
              <FormControl>
                <Input type="number" step="any" placeholder="100" disabled={isPending} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  if (type === "array_contains") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
        <FormField
          control={control}
          name="arrayValueMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("assertions:form.arrayValueMode", "Item type")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ARRAY_VALUE_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {t(mode.labelKey, mode.fallbackLabel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <ExpectedStringField
          control={control}
          disabled={isPending}
          label={t("assertions:form.arrayExpectedItem", "Expected item")}
          multiline={arrayValueMode === "json"}
          placeholder={arrayValueMode === "json" ? '{"name":"VF 8"}' : "VF 8"}
        />
      </div>
    );
  }

  return (
    <ExpectedStringField
      control={control}
      disabled={isPending}
      label={t("assertions:form.expectedValue")}
      multiline={type === "regex"}
      placeholder={type === "regex" ? "^VF\\s+8" : t("assertions:form.expectedValuePlaceholder")}
    />
  );
}

function ExpectedStringField({
  control,
  disabled,
  label,
  placeholder,
  multiline = true,
}: {
  control: ReturnType<typeof useForm<AssertionFormData>>["control"];
  disabled: boolean;
  label: string;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <FormField
      control={control}
      name="expectedValueString"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea placeholder={placeholder} className="min-h-[80px] font-mono text-sm" disabled={disabled} {...field} />
            ) : (
              <Input placeholder={placeholder} disabled={disabled} {...field} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function numericExpectedValue(assertion: AssertionResponse): number | undefined {
  if (
    assertion.type !== "greater_than"
    && assertion.type !== "less_than"
    && assertion.type !== "array_length_greater_than"
  ) {
    return undefined;
  }
  const parsed = typeof assertion.expectedValue === "number"
    ? assertion.expectedValue
    : Number(assertion.expectedValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

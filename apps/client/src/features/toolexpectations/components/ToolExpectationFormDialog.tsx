import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { getToolExpectationSchema, type ToolExpectationFormData } from "../toolExpectations.schemas";
import { useCreateToolExpectation, useUpdateToolExpectation } from "../toolExpectations.queries";
import type { ToolExpectationResponse, ToolExpectationType, TargetSourceType } from "../toolExpectations.types";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface ToolExpectationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ToolExpectationResponse | null;
  testCaseId: string;
}

const TYPE_OPTIONS: { label: string; value: ToolExpectationType }[] = [
  { label: "Tool Must Be Called", value: "TOOL_MUST_BE_CALLED" },
  { label: "Tool Must Not Be Called", value: "TOOL_MUST_NOT_BE_CALLED" },
  { label: "Tool Args Match", value: "TOOL_ARGS_MATCH" },
  { label: "Tool Sequence Match", value: "TOOL_SEQUENCE_MATCH" },
  { label: "Tool Call Count", value: "TOOL_CALL_COUNT" },
  { label: "Tool Output Used in Answer", value: "TOOL_OUTPUT_USED_IN_ANSWER" },
  { label: "Agent Equals", value: "AGENT_EQUALS" },
  { label: "Agent Not Equals", value: "AGENT_NOT_EQUALS" },
  { label: "Agent Step Contains", value: "AGENT_STEP_CONTAINS" },
];

const SOURCE_OPTIONS: { label: string; value: TargetSourceType }[] = [
  { label: "Normalized Tool Calls", value: "normalized_tool_calls" },
  { label: "Inferred Tool", value: "inferred_tool" },
  { label: "Inferred Agent", value: "inferred_agent" },
  { label: "Agent Steps", value: "agent_steps" },
  { label: "Trace", value: "trace" },
  { label: "Custom Component", value: "custom_component" },
];

export function ToolExpectationFormDialog({ open, onOpenChange, item, testCaseId }: ToolExpectationFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!item;

  const createMutation = useCreateToolExpectation(testCaseId);
  const updateMutation = useUpdateToolExpectation();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const [isValidatingJson, setIsValidatingJson] = useState(false);

  const form = useForm<ToolExpectationFormData>({
    resolver: zodResolver(getToolExpectationSchema(t)) as any,
    defaultValues: {
      expectationType: "TOOL_MUST_BE_CALLED",
      targetSource: "normalized_tool_calls",
      toolName: "",
      agentName: "",
      argumentAssertionsString: "",
      sequenceString: "",
      minCalls: 0,
      maxCalls: 0,
      rubricId: "",
      rubricOverride: "",
      threshold: 0.8,
      required: true,
      severity: "MAJOR",
      enabled: true,
      sortOrder: 0,
    },
  });

  const watchType = form.watch("expectationType");

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          expectationType: item.expectationType,
          targetSource: item.targetSource,
          toolName: item.toolName || "",
          agentName: item.agentName || "",
          argumentAssertionsString: item.argumentAssertions ? JSON.stringify(item.argumentAssertions, null, 2) : "",
          sequenceString: item.sequence ? item.sequence.join(", ") : "",
          minCalls: item.minCalls || 0,
          maxCalls: item.maxCalls || 0,
          rubricId: item.rubricPublicId || "",
          rubricOverride: item.rubricOverride || "",
          threshold: item.threshold || 0.8,
          required: item.required ?? true,
          severity: item.severity || "MAJOR",
          enabled: item.enabled ?? true,
          sortOrder: item.sortOrder || 0,
        });
      } else {
        form.reset({
          expectationType: "TOOL_MUST_BE_CALLED",
          targetSource: "normalized_tool_calls",
          toolName: "",
          agentName: "",
          argumentAssertionsString: "",
          sequenceString: "",
          minCalls: 0,
          maxCalls: 0,
          rubricId: "",
          rubricOverride: "",
          threshold: 0.8,
          required: true,
          severity: "MAJOR",
          enabled: true,
          sortOrder: 0,
        });
      }
    }
  }, [open, item, form]);

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      if (!window.confirm(t("toolexpectations:form.messages.unsavedChanges"))) {
        return;
      }
    }
    onOpenChange(newOpen);
  };

  const handleFormatJson = () => {
    const val = form.getValues("argumentAssertionsString");
    if (!val) return;
    try {
      const parsed = JSON.parse(val);
      form.setValue("argumentAssertionsString", JSON.stringify(parsed, null, 2), { shouldValidate: true });
      setIsValidatingJson(true);
      setTimeout(() => setIsValidatingJson(false), 2000);
    } catch {
      form.setError("argumentAssertionsString", { message: t("toolexpectations:form.validation.invalidJsonArray") });
    }
  };

  const onSubmit = (data: ToolExpectationFormData) => {
    let argumentAssertions: Record<string, unknown>[] | undefined = undefined;
    if (data.argumentAssertionsString) {
      try {
        argumentAssertions = JSON.parse(data.argumentAssertionsString);
      } catch {
        form.setError("argumentAssertionsString", { message: t("toolexpectations:form.validation.invalidJsonArray") });
        return;
      }
    }

    const payload = {
      expectationType: data.expectationType,
      targetSource: data.targetSource,
      toolName: data.toolName,
      agentName: data.agentName,
      argumentAssertions,
      sequence: data.sequenceString ? data.sequenceString.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
      minCalls: data.minCalls,
      maxCalls: data.maxCalls,
      rubricId: data.rubricId,
      rubricOverride: data.rubricOverride,
      threshold: data.threshold,
      required: data.required,
      severity: data.severity,
      enabled: data.enabled,
      sortOrder: data.sortOrder,
    };

    if (isEditing) {
      updateMutation.mutate({ id: item.publicId, data: payload }, {
        onSuccess: () => {
          toast.success(t("toolexpectations:form.messages.updated"));
          form.reset({}, { keepValues: true });
          onOpenChange(false);
        },
        onError: () => toast.error(t("toolexpectations:form.messages.updateFailed"))
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("toolexpectations:form.messages.created"));
          form.reset({}, { keepValues: true });
          onOpenChange(false);
        },
        onError: () => toast.error(t("toolexpectations:form.messages.createFailed"))
      });
    }
  };

  const showToolFields = watchType?.startsWith("TOOL_");
  const showAgentFields = watchType?.startsWith("AGENT_");
  const showSequenceFields = watchType === "TOOL_SEQUENCE_MATCH";
  const showCallCountFields = watchType === "TOOL_CALL_COUNT";
  const showArgsFields = watchType === "TOOL_ARGS_MATCH";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEditing ? t("toolexpectations:form.editTitle") : t("toolexpectations:form.createTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("toolexpectations:form.editDesc") : t("toolexpectations:form.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <FormField
                control={form.control}
                name="expectationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("toolexpectations:form.expectationType")}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                        {...field}
                      >
                        {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{t(`toolexpectations:types.${opt.value}`, { defaultValue: opt.label })}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("toolexpectations:form.targetSource")}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                        {...field}
                      >
                        {SOURCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showToolFields && (
                <FormField
                  control={form.control}
                  name="toolName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("toolexpectations:form.toolName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("toolexpectations:form.toolNamePlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showAgentFields && (
                <FormField
                  control={form.control}
                  name="agentName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("toolexpectations:form.agentName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("toolexpectations:form.agentNamePlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showArgsFields && (
                <FormField
                  control={form.control}
                  name="argumentAssertionsString"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("toolexpectations:form.argumentAssertions")}</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={handleFormatJson} className="h-6 text-xs px-2">
                          {isValidatingJson ? <Check className="w-3 h-3 mr-1 text-green-500" /> : null}
                          {t("toolexpectations:form.formatJson")}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder='[{"field": "location", "value": "Paris"}]' className="min-h-[120px] font-mono text-sm" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showSequenceFields && (
                <FormField
                  control={form.control}
                  name="sequenceString"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("toolexpectations:form.sequence")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("toolexpectations:form.sequencePlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">{t("toolexpectations:form.sequenceHint")}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showCallCountFields && (
                <>
                  <FormField
                    control={form.control}
                    name="minCalls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("toolexpectations:form.minCalls")}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxCalls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("toolexpectations:form.maxCalls")}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" disabled={isPending} {...field} />
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
                    <FormLabel>{t("toolexpectations:form.severity")}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                        {...field}
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="MAJOR">MAJOR</option>
                        <option value="MINOR">MINOR</option>
                        <option value="INFO">INFO</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 pt-8 sm:col-span-2 sm:flex-row sm:gap-6">
                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          disabled={isPending}
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal mb-0">{t("toolexpectations:form.required")}</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          disabled={isPending}
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal mb-0">{t("toolexpectations:form.enabled")}</FormLabel>
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

            <DialogFooter className="pt-4 mt-6 border-t pb-6">
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

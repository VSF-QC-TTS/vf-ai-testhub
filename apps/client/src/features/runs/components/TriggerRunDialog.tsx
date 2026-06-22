import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/button";
import { getTriggerRunSchema, type TriggerRunFormData } from "../runs.schemas";
import { useTriggerRun } from "../runs.queries";
import { useTargets } from "../../targets/targets.queries";
import { motion } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { useParams } from "react-router-dom";

interface TriggerRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  onRunStarted?: (runId: string) => void;
}

export function TriggerRunDialog({ open, onOpenChange, datasetId, onRunStarted }: TriggerRunDialogProps) {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();

  const { data: targetsData, isLoading: isLoadingTargets } = useTargets(projectId);
  const targets = targetsData?.content || [];

  const triggerMutation = useTriggerRun(datasetId);
  const isPending = triggerMutation.isPending;
  const mutationError = triggerMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const form = useForm<TriggerRunFormData>({
    resolver: zodResolver(getTriggerRunSchema(t)) as any,
    defaultValues: {
      targetId: "",
      runMode: "FULL_DATASET",
      sectionName: "",
      testCaseIds: [],
      includeLlmJudge: true,
      includeToolExpectations: true,
      maxConcurrency: 3,
      timeoutMs: 30000,
      retryCount: 0,
    },
  });

  const watchRunMode = form.watch("runMode");

  useEffect(() => {
    if (open) {
      form.reset();
      if (targets.length > 0) {
        form.setValue("targetId", targets[0].publicId);
      }
    }
  }, [open, targets, form]);

  const onSubmit = (data: TriggerRunFormData) => {
    triggerMutation.mutate(data, {
      onSuccess: (result) => {
        toast.success(t("runs:form.messages.runStarted"));
        onOpenChange(false);
        if (onRunStarted) {
          onRunStarted(result.publicId);
        }
      },
      onError: () => toast.error(t("runs:form.messages.startFailed"))
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-indigo-500" />
            {t("runs:form.title")}
          </DialogTitle>
          <DialogDescription>
            {t("runs:form.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pt-4">
            <div className="space-y-4">
              
              <FormField
                control={form.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("runs:form.target")}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending || isLoadingTargets}
                        {...field}
                      >
                        <option value="" disabled>{t("runs:form.targetPlaceholder")}</option>
                        {targets.map(opt => <option key={opt.publicId} value={opt.publicId}>{opt.name}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="runMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("runs:form.runMode")}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                        {...field}
                      >
                        <option value="FULL_DATASET">{t("runs:form.modes.full")}</option>
                        <option value="SELECTED_SECTION">{t("runs:form.modes.section")}</option>
                        <option value="SELECTED_CASES">{t("runs:form.modes.cases")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchRunMode === "SELECTED_SECTION" && (
                <FormField
                  control={form.control}
                  name="sectionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("runs:form.section")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("runs:form.sectionPlaceholder")} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchRunMode === "SELECTED_CASES" && (
                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800/50">
                  {t("runs:form.casesNote")}
                </div>
              )}

              <div className="pt-4 pb-2 border-b">
                <h4 className="text-sm font-medium mb-4">{t("runs:form.advancedOptions")}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxConcurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("runs:form.maxConcurrency")}</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="20" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="retryCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("runs:form.retryCount")}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="5" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <FormField
                  control={form.control}
                  name="includeLlmJudge"
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
                      <FormLabel className="font-normal mb-0">{t("runs:form.includeLlmJudge")}</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="includeToolExpectations"
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
                      <FormLabel className="font-normal mb-0">{t("runs:form.includeToolExpectations")}</FormLabel>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t("common:actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {isPending ? t("runs:form.triggering") : t("runs:form.trigger")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

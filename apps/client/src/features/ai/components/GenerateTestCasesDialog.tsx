import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateTestCasesSchema, type GenerateTestCasesDto, type TestCaseDraftDto } from "../ai.schemas";
import { useGenerateTestCases } from "../ai.api";
import { motion, AnimatePresence } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Bot, Sparkles, Check, Edit2 } from "lucide-react";
import { useCreateTestCase } from "@/features/testcases/testcases.queries";
import type { TestCaseCreateRequest } from "@/features/testcases/testcases.types";

interface GenerateTestCasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
}

export function GenerateTestCasesDialog({ open, onOpenChange, datasetId }: GenerateTestCasesDialogProps) {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [drafts, setDrafts] = useState<TestCaseDraftDto[] | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ input: "", expectedBehavior: "" });
  
  const generateMutation = useGenerateTestCases();
  const createTestCaseMutation = useCreateTestCase(datasetId);

  const isPending = generateMutation.isPending;
  const mutationError = generateMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const form = useForm<GenerateTestCasesDto>({
    resolver: zodResolver(generateTestCasesSchema(t)),
    defaultValues: {
      featureName: "",
      businessRequirement: "",
      count: 5,
      language: "en",
    },
  });

  const onSubmit = (data: GenerateTestCasesDto) => {
    if (!projectId) return;
    generateMutation.mutate({ projectId, datasetId, body: data }, {
      onSuccess: (response) => {
        setDrafts(response);
      },
      onError: () => toast.error(t("common:error"))
    });
  };

  const handleSaveDrafts = () => {
    if (!drafts) return;
    
    // In a real app we might batch create, but here we do it sequentially or promise.all
    // depending on the backend. We'll simulate by calling the mutation for each selected draft.
    const promises = drafts.map(draft => {
      const request: TestCaseCreateRequest = {
        name: draft.testCase.name || "AI Generated",
        input: draft.testCase.input || "",
        expectedBehavior: draft.testCase.expectedBehavior || "",
        sectionName: draft.testCase.sectionName,
        enabled: true,
      };
      return createTestCaseMutation.mutateAsync(request);
    });

    Promise.all(promises)
      .then(() => {
        toast.success(`Saved ${drafts.length} test cases.`);
        setDrafts(null);
        onOpenChange(false);
      })
      .catch(() => {
        toast.error("Some test cases failed to save.");
      });
  };

  const handleEditClick = (draft: TestCaseDraftDto) => {
    setEditingDraftId(draft.draftId);
    setEditForm({
      input: draft.testCase.input || "",
      expectedBehavior: draft.testCase.expectedBehavior || ""
    });
  };

  const handleSaveEdit = (draftId: string) => {
    if (!drafts) return;
    setDrafts(drafts.map(d => 
      d.draftId === draftId 
        ? { ...d, testCase: { ...d.testCase, input: editForm.input, expectedBehavior: editForm.expectedBehavior } }
        : d
    ));
    setEditingDraftId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) setDrafts(null);
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {t("ai:generate.title", "Generate AI Test Cases")}
          </DialogTitle>
          <DialogDescription>
            {drafts 
              ? t("ai:generate.reviewDesc", "Review and edit the generated test cases before saving them.")
              : t("ai:generate.formDesc", "Provide instructions to generate new test cases automatically.")}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!drafts ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <p className="text-zinc-500 mb-6 max-w-md">
                    {t("ai:generate.description", "Describe your business requirements and the AI will draft comprehensive test cases for you.")}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="featureName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feature Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Chatbot Login" disabled={isPending} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ai:generate.numCases", "Number of Cases")}</FormLabel>
                          <FormControl>
                            <Input type="number" disabled={isPending} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ai:generate.requirement", "Business Requirement *")}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t("ai:generate.requirementPlaceholder", "Describe what the system should do...")} 
                            className="min-h-[100px]" 
                            disabled={isPending} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {mutationError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                      {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                      {t("common:actions.cancel")}
                    </Button>
                    <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                      {isPending ? <Bot className="h-4 w-4 animate-bounce" /> : <Sparkles className="h-4 w-4" />}
                      {t("ai:generate.submit", "Generate")}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mt-4 flex flex-col gap-4"
            >
              <div className="space-y-4">
                {drafts.map((draft, idx) => {
                  const isEditing = editingDraftId === draft.draftId;
                  
                  return (
                    <div key={draft.draftId} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900/30">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{draft.testCase.name || `Test Case ${idx + 1}`}</h4>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(draft.draftId)}>
                              <Check className="h-4 w-4 mr-1" /> {t("common:actions.save", "Save")}
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditClick(draft)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400">
                        {isEditing ? (
                          <div className="space-y-3 mt-3">
                            <div>
                              <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{t("testCases:form.input", "Input")}</label>
                              <Textarea 
                                value={editForm.input} 
                                onChange={e => setEditForm(prev => ({ ...prev, input: e.target.value }))}
                                className="mt-1 min-h-[60px]"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{t("testCases:form.expectedBehavior", "Expected Behavior")}</label>
                              <Textarea 
                                value={editForm.expectedBehavior} 
                                onChange={e => setEditForm(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                                className="mt-1 min-h-[60px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div><strong className="text-zinc-900 dark:text-zinc-100">{t("testCases:form.input", "Input")}:</strong> {draft.testCase.input}</div>
                            <div><strong className="text-zinc-900 dark:text-zinc-100">{t("testCases:form.expected", "Expected")}:</strong> {draft.testCase.expectedBehavior}</div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setDrafts(null)} disabled={createTestCaseMutation.isPending}>
                  {t("common:actions.cancel", "Discard All")}
                </Button>
                <Button onClick={handleSaveDrafts} disabled={createTestCaseMutation.isPending || drafts.length === 0} className="gap-2">
                  <Check className="h-4 w-4" />
                  {t("common:actions.saveSelected", "Save Selected")} ({drafts.length})
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

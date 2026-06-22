import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSuggestAssertions } from "../ai.api";
import type { AssertionDraftDto, SuggestionResponseDto, SuggestAssertionsDto } from "../ai.schemas";
import { motion, AnimatePresence } from "framer-motion";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import { Bot, Sparkles, Check, Edit2 } from "lucide-react";
import { useCreateAssertion } from "@/features/assertions/assertions.queries";
import type { AssertionCreateRequest } from "@/features/assertions/assertions.types";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/Input";

interface SuggestionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCaseId: string;
  requestPayload: SuggestAssertionsDto;
}

export function SuggestionReviewDialog({ open, onOpenChange, testCaseId, requestPayload }: SuggestionReviewDialogProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<SuggestionResponseDto | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ fieldPath: "", expectedValue: "", rubricOverride: "" });
  
  const suggestMutation = useSuggestAssertions();
  const createAssertionMutation = useCreateAssertion(testCaseId);

  const isPending = suggestMutation.isPending;
  const mutationError = suggestMutation.error;
  const errorCode = mutationError instanceof ApiError ? mutationError.code : undefined;

  const toCreateAssertionRequest = (
    assertion: AssertionDraftDto["assertion"]
  ): AssertionCreateRequest | null => {
    if (!assertion.scope || !assertion.type) {
      return null;
    }

    return {
      scope: assertion.scope,
      type: assertion.type,
      targetComponent: assertion.targetComponent,
      fieldPath: assertion.fieldPath,
      fieldPaths: assertion.fieldPaths,
      expectedValue: assertion.expectedValue,
      rubricId: assertion.rubricId,
      rubricOverride: assertion.rubricOverride,
      threshold: assertion.threshold,
      weight: assertion.weight,
      severity: assertion.severity,
      enabled: true,
      sortOrder: assertion.sortOrder,
    };
  };

  // Trigger suggestion when dialog opens if we don't have suggestions yet
  const handleGenerate = () => {
    suggestMutation.mutate({ testCaseId, body: requestPayload }, {
      onSuccess: (data) => {
        setSuggestions(data);
        // Auto-select all by default
        const allIds = new Set<string>();
        data.assertions.forEach((a) => allIds.add(a.draftId));
        setSelectedIds(allIds);
      },
      onError: () => toast.error(t("common:error"))
    });
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = () => {
    if (!suggestions) return;
    
    const selectedAssertions = suggestions.assertions.filter(a => selectedIds.has(a.draftId));
    
    // Save sequentially or Promise.all
    const promises = selectedAssertions
      .map((draft) => toCreateAssertionRequest(draft.assertion))
      .filter((request): request is AssertionCreateRequest => request !== null)
      .map((request) => createAssertionMutation.mutateAsync(request));

    Promise.all(promises)
      .then(() => {
        toast.success(`Saved ${selectedAssertions.length} assertions.`);
        setSuggestions(null);
        onOpenChange(false);
      })
      .catch(() => {
        toast.error("Failed to save some assertions.");
      });
  };

  const handleEditClick = (e: React.MouseEvent, draft: AssertionDraftDto) => {
    e.stopPropagation();
    setEditingDraftId(draft.draftId);
    setEditForm({
      fieldPath: draft.assertion.fieldPath || "",
      expectedValue: String(draft.assertion.expectedValue || ""),
      rubricOverride: draft.assertion.rubricOverride || ""
    });
  };

  const handleSaveEdit = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (!suggestions) return;
    setSuggestions({
      ...suggestions,
      assertions: suggestions.assertions.map(d => 
        d.draftId === draftId 
          ? { 
              ...d, 
              assertion: { 
                ...d.assertion, 
                fieldPath: d.assertion.type === "equals" ? editForm.fieldPath : d.assertion.fieldPath,
                expectedValue: d.assertion.type === "equals" ? editForm.expectedValue : d.assertion.expectedValue,
                rubricOverride: d.assertion.type === "llm_rubric" ? editForm.rubricOverride : d.assertion.rubricOverride 
              } 
            }
          : d
      )
    });
    setEditingDraftId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) setSuggestions(null);
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {t("ai:suggestions.title", "AI Assertion Suggestions")}
          </DialogTitle>
          <DialogDescription>
            {suggestions 
              ? t("ai:suggestions.reviewDesc", "Review the suggested assertions. Uncheck the ones you want to discard.")
              : t("ai:suggestions.generateDesc", "Ask the AI to analyze this test case and suggest verification rules.")}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!suggestions ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-zinc-500 mb-6 max-w-md">
                {t("ai:suggestions.description", "The AI will use the input, expected behavior, and reference answer to draft the most relevant JSONPath and LLM Rubric assertions.")}
              </p>
              
              {mutationError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mb-6 w-full">
                  {errorCode ? t(`api:${errorCode}`, { defaultValue: t("errors:unknown") }) : t("errors:unknown")}
                </div>
              )}

              <Button onClick={handleGenerate} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                {isPending ? t("ai:suggestions.analyzing", "Analyzing...") : t("ai:suggestions.generate", "Generate Suggestions")}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex flex-col gap-4"
            >
              {suggestions.assertions.length === 0 && (
                <div className="text-center py-8 text-zinc-500">{t("assertions:emptyDesc", "No suggestions could be generated.")}</div>
              )}
              
              <div className="space-y-3">
                {suggestions.assertions.map((draft) => {
                  const isSelected = selectedIds.has(draft.draftId);
                  const isEditing = editingDraftId === draft.draftId;
                  
                  return (
                    <div 
                      key={draft.draftId} 
                      className={`border rounded-lg p-4 transition-colors ${!isEditing && 'cursor-pointer'} ${
                        isSelected 
                          ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10" 
                          : "border-zinc-200 dark:border-zinc-800 opacity-60 grayscale"
                      }`}
                      onClick={() => !isEditing && toggleSelection(draft.draftId)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-5 w-5 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'border border-zinc-300 dark:border-zinc-700'}`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="font-medium text-sm">
                            {draft.assertion.type === "llm_rubric" ? t("assertions:types.LLM_RUBRIC", "LLM Judge Evaluation") : t("assertions:types.EQUALS", "Field Match")}
                          </span>
                          <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded ml-2">
                            {draft.assertion.scope}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={(e) => handleSaveEdit(e, draft.draftId)}>
                              <Check className="h-4 w-4 mr-1" /> {t("common:actions.save", "Save")}
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleEditClick(e, draft)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="ml-7 text-sm text-zinc-600 dark:text-zinc-400">
                        {isEditing ? (
                          <div className="space-y-3 mt-3" onClick={e => e.stopPropagation()}>
                            {draft.assertion.type === "equals" && (
                              <>
                                <div>
                                  <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{t("assertions:form.fieldPath", "Field Path")}</label>
                                  <Input 
                                    value={editForm.fieldPath} 
                                    onChange={(e) => setEditForm(prev => ({ ...prev, fieldPath: e.target.value }))}
                                    className="mt-1 h-8"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{t("assertions:form.expectedValue", "Expected Value")}</label>
                                  <Input 
                                    value={editForm.expectedValue} 
                                    onChange={(e) => setEditForm(prev => ({ ...prev, expectedValue: e.target.value }))}
                                    className="mt-1 h-8"
                                  />
                                </div>
                              </>
                            )}
                            {draft.assertion.type === "llm_rubric" && (
                              <div>
                                <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{t("assertions:form.rubricOverride", "Rubric Override")}</label>
                                <Textarea 
                                  value={editForm.rubricOverride} 
                                  onChange={e => setEditForm(prev => ({ ...prev, rubricOverride: e.target.value }))}
                                  className="mt-1 min-h-[60px]"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {draft.assertion.type === "equals" && (
                              <div><strong className="text-zinc-900 dark:text-zinc-100">{t("assertions:form.fieldPath", "Path")}:</strong> {draft.assertion.fieldPath} == {String(draft.assertion.expectedValue)}</div>
                            )}
                            {draft.assertion.type === "llm_rubric" && (
                              <div><strong className="text-zinc-900 dark:text-zinc-100">{t("assertions:form.rubricOverride", "Rubric")}:</strong> {draft.assertion.rubricOverride}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setSuggestions(null)} disabled={createAssertionMutation.isPending}>
                  {t("common:actions.cancel", "Discard All")}
                </Button>
                <Button onClick={handleSave} disabled={createAssertionMutation.isPending || selectedIds.size === 0} className="gap-2">
                  <Check className="h-4 w-4" />
                  {t("common:actions.saveSelected", "Save Selected")} ({selectedIds.size})
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

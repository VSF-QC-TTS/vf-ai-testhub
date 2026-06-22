import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAssertions, useDeleteAssertion } from "../assertions.queries";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";
import { Plus, MoreVertical, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { toast } from "sonner";
import { AssertionFormDialog } from "./AssertionFormDialog";
import type { AssertionResponse } from "../assertions.types";
import { buildAssertionSummary, getAssertionGroup, getAssertionGroupLabel, getAssertionTypeLabel } from "../assertions.ui";

interface AssertionListProps {
  testCaseId: string;
}

export function AssertionList({ testCaseId }: AssertionListProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useAssertions(testCaseId);
  const deleteMutation = useDeleteAssertion();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssertion, setEditingAssertion] = useState<AssertionResponse | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AssertionResponse | null>(null);

  const assertions = data?.content || [];
  const isEmpty = !isLoading && assertions.length === 0;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("assertions:title")}</h3>
        <Button onClick={() => { setEditingAssertion(null); setIsFormOpen(true); }} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("assertions:addAssertion")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-zinc-50 dark:bg-zinc-900/50">
          <ShieldAlert className="h-8 w-8 text-zinc-400 mb-3" />
          <p className="text-sm text-zinc-500 max-w-sm mb-4">{t("assertions:emptyDesc")}</p>
          <Button onClick={() => { setEditingAssertion(null); setIsFormOpen(true); }} variant="outline" size="sm">
            {t("assertions:addAssertion")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {assertions.map(assertion => (
            <div key={assertion.publicId} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-zinc-950 group">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{getAssertionTypeLabel(t, assertion.type)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {getAssertionGroupLabel(t, getAssertionGroup(assertion.type))}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {assertion.scope}
                  </span>
                  {!assertion.enabled && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {t("assertions:disabled")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground break-words">
                  {buildAssertionSummary(t, assertion)}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => { setEditingAssertion(assertion); setIsFormOpen(true); }}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t("common:actions.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPendingDelete(assertion)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("common:actions.deleteConfirm").split("?")[0]}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <AssertionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        assertion={editingAssertion}
        testCaseId={testCaseId}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("assertions:delete.title")}</DialogTitle>
            <DialogDescription>{t("assertions:delete.desc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)} disabled={deleteMutation.isPending}>
              {t("common:actions.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={() => {
              if (pendingDelete) {
                deleteMutation.mutate(pendingDelete.publicId, {
                  onSuccess: () => {
                    setPendingDelete(null);
                    toast.success(t("assertions:form.messages.deleted"));
                  },
                  onError: () => toast.error(t("assertions:form.messages.deleteFailed"))
                });
              }
            }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("assertions:delete.deleting") : t("common:actions.deleteConfirm").split("?")[0]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

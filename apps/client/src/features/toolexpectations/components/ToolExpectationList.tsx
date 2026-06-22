import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToolExpectations, useDeleteToolExpectation } from "../toolExpectations.queries";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";
import { Plus, MoreVertical, Edit2, Trash2, Wrench } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { toast } from "sonner";
import { ToolExpectationFormDialog } from "./ToolExpectationFormDialog";
import type { ToolExpectationResponse } from "../toolExpectations.types";

interface ToolExpectationListProps {
  testCaseId: string;
}

export function ToolExpectationList({ testCaseId }: ToolExpectationListProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useToolExpectations(testCaseId);
  const deleteMutation = useDeleteToolExpectation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ToolExpectationResponse | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ToolExpectationResponse | null>(null);

  const items = data?.content || [];
  const isEmpty = !isLoading && items.length === 0;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("toolexpectations:title")}</h3>
        <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("toolexpectations:addExpectation")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-zinc-50 dark:bg-zinc-900/50">
          <Wrench className="h-8 w-8 text-zinc-400 mb-3" />
          <p className="text-sm text-zinc-500 max-w-sm mb-4">{t("toolexpectations:emptyDesc")}</p>
          <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} variant="outline" size="sm">
            {t("toolexpectations:addExpectation")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.publicId} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-zinc-950 group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{t(`toolexpectations:types.${item.expectationType}`, { defaultValue: item.expectationType })}</span>
                  {item.targetSource && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {item.targetSource}
                    </span>
                  )}
                  {!item.enabled && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {t("toolexpectations:disabled")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.toolName && <span className="mr-3">Tool: <span className="font-mono text-xs text-foreground bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{item.toolName}</span></span>}
                  {item.agentName && <span>Agent: <span className="font-mono text-xs text-foreground bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{item.agentName}</span></span>}
                  {item.expectationType === "TOOL_CALL_COUNT" && <span> (Min: {item.minCalls}, Max: {item.maxCalls})</span>}
                  {item.sequence && item.sequence.length > 0 && <div className="mt-1">Sequence: <span className="font-mono text-xs">{item.sequence.join(" → ")}</span></div>}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => { setEditingItem(item); setIsFormOpen(true); }}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t("common:actions.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPendingDelete(item)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("common:actions.deleteConfirm").split("?")[0]}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <ToolExpectationFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={editingItem}
        testCaseId={testCaseId}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("toolexpectations:delete.title")}</DialogTitle>
            <DialogDescription>{t("toolexpectations:delete.desc")}</DialogDescription>
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
                    toast.success(t("toolexpectations:form.messages.deleted"));
                  },
                  onError: () => toast.error(t("toolexpectations:form.messages.deleteFailed"))
                });
              }
            }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("toolexpectations:delete.deleting") : t("common:actions.deleteConfirm").split("?")[0]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


import { useTranslation } from "react-i18next";
import type { MouseEvent } from "react";
import { Plus, Target, Search, MoreVertical, Trash2, Edit2, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTargets, useDeleteTarget } from "../targets.queries";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import { projectTargetsPath } from "../../projects/project.routes";
import type { TargetResponse } from "../targets.types";
import { useState } from "react";

export function TargetListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId = "" } = useParams();
  const { data, isLoading } = useTargets(projectId);
  const deleteMutation = useDeleteTarget();
  const [targetPendingDelete, setTargetPendingDelete] = useState<TargetResponse | null>(null);

  const targets = data?.content || [];
  const isEmpty = !isLoading && targets.length === 0;

  const handleCreate = () => {
    navigate(`${projectTargetsPath(projectId)}/new`);
  };

  const handleEdit = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`${projectTargetsPath(projectId)}/${id}`);
  };

  const handleDeleteRequest = (target: TargetResponse, e: MouseEvent) => {
    e.stopPropagation();
    setTargetPendingDelete(target);
  };

  const handleDeleteConfirm = () => {
    if (!targetPendingDelete) {
      return;
    }

    deleteMutation.mutate(targetPendingDelete.publicId, {
      onSuccess: () => setTargetPendingDelete(null),
    });
  };

  if (!projectId) {
    return <div className="p-8 text-center text-muted-foreground">{t("targets:missingProject")}</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("targets:title")}</h1>
          <p className="text-muted-foreground mt-1">{t("targets:description")}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t("targets:create")}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[160px] rounded-lg" />
          ))}
        </div>
      ) : isEmpty ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20"
        >
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <Target className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("targets:empty.title")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">{t("targets:empty.description")}</p>
          <Button onClick={handleCreate} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("targets:create")}
          </Button>
        </motion.div>
      ) : (
        /* Grid Layout */
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder={t("targets:searchPlaceholder")}
              className="pl-9 bg-white dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {targets.map((target, idx) => (
                <motion.div
                  key={target.publicId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.05 }}
                  onClick={(e) => handleEdit(target.publicId, e)}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={(e) => handleEdit(target.publicId, e)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t("targets:edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDeleteRequest(target, e)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("targets:delete.confirm")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-lg font-medium tracking-tight mb-1">{target.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                    <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{target.method || "GET"}</span>
                    <span className="truncate" title={target.url}>{target.url || t("targets:noUrl")}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider">
                      {target.environment || "default"}
                    </span>
                    {target.isDefault && (
                      <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider">
                        {t("targets:primary")}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <Dialog open={!!targetPendingDelete} onOpenChange={(open) => !open && setTargetPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("targets:delete.title")}</DialogTitle>
            <DialogDescription>{t("targets:delete.desc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTargetPendingDelete(null)} disabled={deleteMutation.isPending}>
              {t("common:actions.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("targets:delete.deleting") : t("targets:delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

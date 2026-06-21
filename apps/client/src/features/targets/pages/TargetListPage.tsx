import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Target, Search, MoreVertical, Trash2, Edit2, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTargets, useDeleteTarget } from "../targets.queries";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { useProjectStore } from "../../projects/project.store";
import { useNavigate } from "react-router-dom";

export function TargetListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const { data, isLoading } = useTargets(activeProjectId);
  const deleteMutation = useDeleteTarget();

  const targets = data?.content || [];
  const isEmpty = !isLoading && targets.length === 0;

  const handleCreate = () => {
    navigate("/targets/new");
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/targets/${id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("common:actions.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  if (!activeProjectId) {
    return <div className="p-8 text-center text-muted-foreground">Please select a project first.</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Targets</h1>
          <p className="text-muted-foreground mt-1">Configure APIs and environments to be evaluated.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Target
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[160px] rounded-2xl" />
          ))}
        </div>
      ) : isEmpty ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 min-h-[400px]"
        >
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <Target className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">No Targets Yet</h2>
          <p className="text-zinc-500 max-w-sm mb-8">Set up your first API target to begin evaluating prompts and testing endpoints.</p>
          <Button onClick={handleCreate} size="lg" className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Create Target
          </Button>
        </motion.div>
      ) : (
        /* Grid Layout */
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search targets..." 
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
                  onClick={(e) => handleEdit(target.publicId, e as any)}
                  className="group relative flex flex-col bg-white dark:bg-zinc-950 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
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
                        <DropdownMenuItem onClick={(e) => handleEdit(target.publicId, e as any)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Target
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDelete(target.publicId, e as any)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-lg font-medium tracking-tight mb-1">{target.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                    <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{target.method || "GET"}</span>
                    <span className="truncate" title={target.url}>{target.url || "No URL"}</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider">
                      {target.environment || "default"}
                    </span>
                    {target.isDefault && (
                      <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider">
                        Primary
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

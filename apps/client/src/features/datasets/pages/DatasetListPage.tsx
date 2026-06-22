import { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Database, Search, MoreVertical, Trash2, Edit2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDatasets, useDeleteDataset } from "../datasets.queries";
import { DatasetFormDialog } from "../components/DatasetFormDialog";
import { GenerateTestCasesDialog } from "../../ai/components/GenerateTestCasesDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { DatasetResponse } from "../datasets.types";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { projectModulePath } from "../../projects/project.routes";

export function DatasetListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchString = searchParams.get("search") || "";

  const { data, isLoading } = useDatasets(projectId, { search: searchString });
  const deleteMutation = useDeleteDataset(projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<DatasetResponse | null>(null);
  const [generationDataset, setGenerationDataset] = useState<DatasetResponse | null>(null);
  const [datasetPendingDelete, setDatasetPendingDelete] = useState<DatasetResponse | null>(null);

  const datasets = data?.content || [];
  const isEmpty = !isLoading && datasets.length === 0 && !searchString;
  const isSearchEmpty = !isLoading && datasets.length === 0 && !!searchString;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchParams(prev => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    }, { replace: true });
  };

  const handleCreate = () => {
    setEditingDataset(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dataset: DatasetResponse, e: MouseEvent) => {
    e.stopPropagation();
    setEditingDataset(dataset);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (dataset: DatasetResponse, e: MouseEvent) => {
    e.stopPropagation();
    setDatasetPendingDelete(dataset);
  };

  const handleGenerateRequest = (dataset: DatasetResponse, e: MouseEvent) => {
    e.stopPropagation();
    setGenerationDataset(dataset);
  };

  const handleDeleteConfirm = () => {
    if (!datasetPendingDelete) {
      return;
    }

    deleteMutation.mutate(datasetPendingDelete.publicId, {
      onSuccess: () => {
        setDatasetPendingDelete(null);
        toast.success(t("common:success"));
      },
      onError: () => toast.error(t("common:error"))
    });
  };

  const handleSelectDataset = (id: string) => {
    navigate(`${projectModulePath(projectId, "datasets")}/${id}/test-cases`);
  };

  if (!projectId) {
    return <div className="p-8 text-center text-muted-foreground">{t("datasets:missingProject")}</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("datasets:title")}</h1>
          <p className="text-muted-foreground mt-1">{t("datasets:description")}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t("datasets:create")}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-[250px]" />
          <div className="rounded-lg border">
            <div className="h-12 border-b px-4 flex items-center"><Skeleton className="h-5 w-full" /></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 border-b px-4 flex items-center"><Skeleton className="h-5 w-full" /></div>
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Database className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("datasets:empty.title")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">{t("datasets:empty.description")}</p>
          <Button onClick={handleCreate} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("datasets:create")}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder={t("datasets:searchPlaceholder")}
              className="pl-9 bg-white dark:bg-zinc-950"
              value={searchString}
              onChange={handleSearch}
            />
          </div>

          {isSearchEmpty ? (
            <div className="p-8 text-center border rounded-lg bg-surface text-muted-foreground">
              {t("datasets:emptySearch")}
            </div>
          ) : (
            <div className="rounded-xl border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                  <TableRow>
                    <TableHead className="w-[300px]">{t("datasets:fields.name")}</TableHead>
                    <TableHead>{t("datasets:fields.category")}</TableHead>
                    <TableHead>{t("datasets:fields.tags")}</TableHead>
                    <TableHead className="text-right">{t("datasets:fields.testCaseCount")}</TableHead>
                    <TableHead>{t("datasets:fields.updatedAt")}</TableHead>
                    <TableHead className="text-right w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {datasets.map((dataset) => (
                      <TableRow
                        key={dataset.publicId}
                        className="cursor-pointer group"
                        onClick={() => handleSelectDataset(dataset.publicId)}
                      >
                        <TableCell className="font-medium">
                          <div>{dataset.name}</div>
                          {dataset.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[250px] mt-1">
                              {dataset.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {dataset.category ? (
                            <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              {dataset.category}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {dataset.tags && dataset.tags.length > 0 ? (
                              dataset.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-zinc-600 dark:text-zinc-400">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            {dataset.tags && dataset.tags.length > 3 && (
                              <span className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                                +{dataset.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {dataset.testCaseCount || 0}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {dataset.updatedAt ? new Date(dataset.updatedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={(e) => handleGenerateRequest(dataset, e)}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                {t("ai:generate.menuItem", "Generate test cases")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleEdit(dataset, e)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                {t("common:actions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDeleteRequest(dataset, e)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common:actions.deleteConfirm").split('?')[0]}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <DatasetFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        dataset={editingDataset}
      />

      {generationDataset && (
        <GenerateTestCasesDialog
          open={!!generationDataset}
          onOpenChange={(open) => {
            if (!open) {
              setGenerationDataset(null);
            }
          }}
          datasetId={generationDataset.publicId}
        />
      )}

      <Dialog open={!!datasetPendingDelete} onOpenChange={(open) => !open && setDatasetPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("datasets:delete.title")}</DialogTitle>
            <DialogDescription>{t("datasets:delete.desc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDatasetPendingDelete(null)} disabled={deleteMutation.isPending}>
              {t("common:actions.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("datasets:delete.deleting") : t("datasets:delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { type ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ListChecks, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useSearchParams } from "react-router-dom";
import { useTestCases, useDeleteTestCase } from "../testcases.queries";
import { Input } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { TestCaseFormDialog } from "../components/TestCaseFormDialog";
import { TestCaseImportDialog } from "../components/TestCaseImportDialog";
import { TriggerRunDialog } from "../../runs/components/TriggerRunDialog";
import { RunProgressPanel } from "../../runs/components/RunProgressPanel";
import { UploadCloud, Play, History } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { TestCaseResponse, TestCaseSource, TestPriority } from "../testcases.types";
import { useDataset } from "../../datasets/datasets.queries";

const ALL_FILTER_VALUE = "__all__";

export function TestCaseListPage() {
  const { t } = useTranslation();
  const { projectId = "", datasetId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchString = searchParams.get("search") || "";
  const priorityFilter = searchParams.get("priority") as TestPriority | undefined;
  const enabledFilter = searchParams.get("enabled");
  const sourceFilter = searchParams.get("source") as TestCaseSource | undefined;
  const tagFilter = searchParams.get("tag") || "";
  const sectionFilter = searchParams.get("sectionName") || "";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCaseResponse | null>(null);
  const [testCasePendingDelete, setTestCasePendingDelete] = useState<TestCaseResponse | null>(null);
  
  const deleteMutation = useDeleteTestCase();
  const { data: datasetData } = useDataset(projectId, datasetId);
  const { data, isLoading } = useTestCases(datasetId, {
    search: searchString,
    priority: priorityFilter,
    enabled: enabledFilter ? enabledFilter === "true" : undefined,
    source: sourceFilter,
    tag: tagFilter,
    sectionName: sectionFilter,
  });

  const testcases = data?.content || [];
  const hasFilters = searchString || priorityFilter || enabledFilter || sourceFilter || tagFilter || sectionFilter;
  const isEmpty = !isLoading && testcases.length === 0 && !hasFilters;
  const isSearchEmpty = !isLoading && testcases.length === 0 && !!hasFilters;

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    }, { replace: true });
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("search", e.target.value);
  };

  if (!datasetId) {
    return <div className="p-8 text-center text-muted-foreground">{t("testcases:missingDatasetId")}</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{datasetData?.name || t("testcases:title")}</h1>
          <p className="text-muted-foreground mt-1">{t("testcases:description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link to={`/projects/${projectId}/datasets/${datasetId}/runs`}>
              <History className="h-4 w-4" />
              History
            </Link>
          </Button>
          <Button onClick={() => setIsTriggerOpen(true)} className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Play className="h-4 w-4" />
            Run
          </Button>
          <Button onClick={() => setIsImportOpen(true)} variant="outline" className="gap-2 shrink-0">
            <UploadCloud className="h-4 w-4" />
            {t("testcases:import.title")}
          </Button>
          <Button onClick={() => { setEditingTestCase(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {t("testcases:addTestCase")}
          </Button>
        </div>
      </div>

      {activeRunId && <RunProgressPanel runId={activeRunId} />}
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <ListChecks className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("testcases:noTestCases")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">{t("testcases:noTestCasesDesc")}</p>
          <Button onClick={() => { setEditingTestCase(null); setIsFormOpen(true); }} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("testcases:addTestCase")}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder={t("testcases:searchPlaceholder")}
                className="pl-9 bg-white dark:bg-zinc-950"
                value={searchString}
                onChange={handleSearch}
              />
            </div>

            <Select
              value={priorityFilter || ALL_FILTER_VALUE}
              onValueChange={(value) => handleFilterChange("priority", value === ALL_FILTER_VALUE ? "" : value)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>{t("testcases:allPriorities")}</SelectItem>
                <SelectItem value="P0">P0</SelectItem>
                <SelectItem value="P1">P1</SelectItem>
                <SelectItem value="P2">P2</SelectItem>
                <SelectItem value="P3">P3</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={enabledFilter || ALL_FILTER_VALUE}
              onValueChange={(value) => handleFilterChange("enabled", value === ALL_FILTER_VALUE ? "" : value)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>{t("testcases:allStates")}</SelectItem>
                <SelectItem value="true">{t("testcases:enabled")}</SelectItem>
                <SelectItem value="false">{t("testcases:disabled")}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder={t("testcases:sectionPlaceholder")}
              className="w-full sm:max-w-[150px] bg-white dark:bg-zinc-950"
              value={sectionFilter}
              onChange={(e) => handleFilterChange("sectionName", e.target.value)}
            />

            <Input
              placeholder={t("testcases:tagPlaceholder")}
              className="w-full sm:max-w-[150px] bg-white dark:bg-zinc-950"
              value={tagFilter}
              onChange={(e) => handleFilterChange("tag", e.target.value)}
            />
          </div>

          {isSearchEmpty ? (
            <div className="p-8 text-center border rounded-lg bg-surface text-muted-foreground">
              {t("testcases:noMatches")}
            </div>
          ) : (
            <div className="rounded-xl border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 sticky top-0">
                  <TableRow>
                    <TableHead className="w-[120px]">{t("testcases:columns.extId")}</TableHead>
                    <TableHead className="w-[150px]">{t("testcases:columns.section")}</TableHead>
                    <TableHead>{t("testcases:columns.input")}</TableHead>
                    <TableHead>{t("testcases:columns.expected")}</TableHead>
                    <TableHead className="w-[150px]">{t("testcases:columns.tags")}</TableHead>
                    <TableHead className="w-[80px]">{t("testcases:columns.priority")}</TableHead>
                    <TableHead className="w-[80px]">{t("testcases:columns.status")}</TableHead>
                    <TableHead className="text-right w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {testcases.map((tc) => (
                      <TableRow key={tc.publicId} className="group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {tc.externalId || "-"}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs truncate block max-w-[150px]" title={tc.sectionName}>
                            {tc.sectionName || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium truncate max-w-[250px] lg:max-w-[350px]" title={tc.input}>
                            {tc.input || <span className="text-muted-foreground italic">{t("testcases:noInput")}</span>}
                          </div>
                          {tc.name && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]" title={tc.name}>
                              {tc.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground truncate max-w-[250px] lg:max-w-[350px]" title={tc.expectedBehavior}>
                            {tc.expectedBehavior || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tc.tags && tc.tags.length > 0 ? (
                              tc.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            {tc.tags && tc.tags.length > 2 && (
                              <span className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                                +{tc.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            tc.priority === "P0" ? "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-500/20" :
                            tc.priority === "P1" ? "bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-900/10 dark:text-orange-400 dark:ring-orange-500/20" :
                            "bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-900/10 dark:text-zinc-400 dark:ring-zinc-500/20"
                          }`}>
                            {tc.priority || "P3"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tc.enabled ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-500/20">
                              {t("testcases:enabled")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-900/10 dark:text-zinc-400 dark:ring-zinc-500/20">
                              {t("testcases:disabled")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => { setEditingTestCase(tc); setIsFormOpen(true); }}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                {t("common:actions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTestCasePendingDelete(tc)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common:actions.deleteConfirm").split("?")[0]}
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

      <TriggerRunDialog
        open={isTriggerOpen}
        onOpenChange={setIsTriggerOpen}
        datasetId={datasetId}
        onRunStarted={setActiveRunId}
      />
      <TestCaseImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />

      <TestCaseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        testCase={editingTestCase}
      />

      <Dialog open={!!testCasePendingDelete} onOpenChange={(open) => !open && setTestCasePendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("testcases:delete.title")}</DialogTitle>
            <DialogDescription>{t("testcases:delete.desc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTestCasePendingDelete(null)} disabled={deleteMutation.isPending}>
              {t("common:actions.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={() => {
              if (testCasePendingDelete) {
                deleteMutation.mutate(testCasePendingDelete.publicId, {
                  onSuccess: () => {
                    setTestCasePendingDelete(null);
                    toast.success(t("testcases:form.messages.deleted"));
                  },
                  onError: () => toast.error(t("testcases:form.messages.deleteFailed"))
                });
              }
            }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("testcases:delete.deleting") : t("common:actions.deleteConfirm").split("?")[0]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

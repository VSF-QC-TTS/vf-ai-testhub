import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Plus, Search, Scale, Archive, Edit2, Globe, FolderKanban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectRubrics, useGlobalRubrics, useArchiveRubric } from "../rubrics.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams } from "react-router-dom";
import type { RubricSnapshotDto } from "../rubrics.schemas";
import { toast } from "sonner";
import { RubricFormDialog } from "../components/RubricFormDialog";

export function RubricListPage() {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<"project" | "global">("project");
  
  const { data: projectData, isLoading: isLoadingProject } = useProjectRubrics(projectId);
  const { data: globalData, isLoading: isLoadingGlobal } = useGlobalRubrics();
  
  const archiveMutation = useArchiveRubric();
  
  const [rubricPendingArchive, setRubricPendingArchive] = useState<RubricSnapshotDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<RubricSnapshotDto | null>(null);

  const currentData = activeTab === "project" ? projectData : globalData;
  const isLoading = activeTab === "project" ? isLoadingProject : isLoadingGlobal;
  const rubrics = currentData?.content || [];
  const isEmpty = !isLoading && rubrics.length === 0;

  const handleCreate = () => {
    setEditingRubric(null);
    setFormOpen(true);
  };

  const handleEdit = (rubric: RubricSnapshotDto) => {
    setEditingRubric(rubric);
    setFormOpen(true);
  };

  const handleArchiveRequest = (rubric: RubricSnapshotDto) => {
    setRubricPendingArchive(rubric);
  };

  const handleArchiveConfirm = () => {
    if (!rubricPendingArchive) return;
    archiveMutation.mutate(rubricPendingArchive.publicId, {
      onSuccess: () => {
        setRubricPendingArchive(null);
        toast.success(t("common:success"));
      },
      onError: () => toast.error(t("common:error"))
    });
  };

  if (!projectId) {
    return <div className="p-8 text-center text-muted-foreground">{t("errors:missingProjectId", "Missing Project ID")}</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("rubrics:title", "Rubrics")}</h1>
          <p className="text-muted-foreground mt-1">{t("rubrics:description", "Manage grading criteria for your LLM judges")}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t("rubrics:create", "Create Rubric")}
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("project")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "project"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          {t("rubrics:tabs.project", "Project Rubrics")}
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "global"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4" />
          {t("rubrics:tabs.global", "Global Rubrics")}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder={t("rubrics:searchPlaceholder", "Search rubrics...")} className="pl-9 bg-white dark:bg-zinc-950" />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20"
        >
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <Scale className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("rubrics:empty.title", "No rubrics found")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">
            {activeTab === "project" 
              ? t("rubrics:empty.project", "You haven't created any custom rubrics for this project yet.")
              : t("rubrics:empty.global", "No global rubrics are available.")}
          </p>
          {activeTab === "project" && (
            <Button onClick={handleCreate} size="lg" className="gap-2">
              <Plus className="h-4 w-4" /> {t("rubrics:create", "Create Rubric")}
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-950 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("rubrics:fields.name", "Name")}</TableHead>
                <TableHead>{t("rubrics:fields.category", "Category")}</TableHead>
                <TableHead>{t("rubrics:fields.language", "Language")}</TableHead>
                <TableHead>{t("rubrics:fields.status", "Status")}</TableHead>
                <TableHead className="text-right">{t("rubrics:fields.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {rubrics.map((rubric: RubricSnapshotDto) => (
                  <TableRow key={rubric.publicId}>
                    <TableCell className="font-medium">
                      <div>{rubric.name}</div>
                      <div className="text-xs text-muted-foreground font-normal truncate max-w-[300px]">
                        {rubric.description || t("rubrics:fields.noDescription", "No description")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rubric.category ? t(`rubrics:categories.${rubric.category}`, { defaultValue: rubric.category }) : "-"}
                    </TableCell>
                    <TableCell>
                      {rubric.language && (
                        <span className="font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">
                          {rubric.language === "vi" ? "Tiếng Việt" : rubric.language === "en" ? "English" : rubric.language}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rubric.archived ? (
                        <span className="text-xs font-medium text-muted-foreground">{t("rubrics:fields.archived", "Archived")}</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t("rubrics:fields.active", "Active")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(rubric)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" 
                          onClick={() => handleArchiveRequest(rubric)}
                          disabled={rubric.archived}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!rubricPendingArchive} onOpenChange={(open) => !open && setRubricPendingArchive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rubrics:archive.title", "Archive Rubric")}</DialogTitle>
            <DialogDescription>
              {t("rubrics:archive.desc", "Are you sure you want to archive this rubric? It will no longer be available for new evaluations.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRubricPendingArchive(null)} disabled={archiveMutation.isPending}>
              {t("common:actions.cancel", "Cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleArchiveConfirm} disabled={archiveMutation.isPending}>
              {archiveMutation.isPending ? t("rubrics:archive.archiving", "Archiving...") : t("rubrics:archive.confirm", "Archive")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RubricFormDialog open={formOpen} onOpenChange={setFormOpen} rubric={editingRubric} />
    </div>
  );
}

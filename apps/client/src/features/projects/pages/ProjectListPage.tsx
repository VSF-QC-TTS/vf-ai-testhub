import { useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, FolderGit2, Search, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, useArchiveProject } from "../projects.queries";
import { ProjectFormDialog } from "../components/ProjectFormDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import type { ProjectResponse } from "../projects.types";
import { useProjectStore } from "../project.store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { projectTargetsPath } from "../project.routes";

export function ProjectListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchString = searchParams.get("search") || "";

  const { data, isLoading } = useProjects({ search: searchString });
  const archiveMutation = useArchiveProject();
  const setLastProject = useProjectStore((state) => state.setLastProject);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [projectPendingArchive, setProjectPendingArchive] = useState<ProjectResponse | null>(null);

  const projects = data?.content || [];
  const isEmpty = !isLoading && projects.length === 0;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchParams(prev => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    }, { replace: true });
  };

  const handleCreate = () => {
    navigate("/projects/new");
  };

  const handleEdit = (project: ProjectResponse, e: MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleArchiveRequest = (project: ProjectResponse, e: MouseEvent) => {
    e.stopPropagation();
    setProjectPendingArchive(project);
  };

  const handleArchiveConfirm = () => {
    if (!projectPendingArchive) {
      return;
    }

    archiveMutation.mutate(projectPendingArchive.id, {
      onSuccess: () => setProjectPendingArchive(null),
    });
  };

  const handleSelectProject = (id: string) => {
    setLastProject(id);
    navigate(projectTargetsPath(id));
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("projects:title")}</h1>
          <p className="text-muted-foreground mt-1">{t("projects:list.desc")}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t("projects:list.create")}
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
            <FolderGit2 className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("projects:empty.title")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">{t("projects:empty.desc")}</p>
          <Button onClick={handleCreate} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("projects:empty.cta")}
          </Button>
        </motion.div>
      ) : (
        /* Grid Layout */
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder={t("projects:list.search")} 
              className="pl-9 bg-white dark:bg-zinc-950"
              value={searchString}
              onChange={handleSearch}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.05 }}
                  onClick={() => handleSelectProject(project.id)}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <FolderGit2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={(e) => handleEdit(project, e)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t("projects:form.editTitle")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleArchiveRequest(project, e)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("projects:delete.confirm")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-lg font-medium tracking-tight mb-1">{project.name}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 flex-1">
                    {project.description || t("projects:list.noDescription")}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>{t("projects:list.createdAt", { date: new Date(project.createdAt).toLocaleDateString() })}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ProjectFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        project={editingProject} 
      />

      <Dialog open={!!projectPendingArchive} onOpenChange={(open) => !open && setProjectPendingArchive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projects:delete.title")}</DialogTitle>
            <DialogDescription>{t("projects:delete.desc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setProjectPendingArchive(null)} disabled={archiveMutation.isPending}>
              {t("projects:delete.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleArchiveConfirm} disabled={archiveMutation.isPending}>
              {archiveMutation.isPending ? t("projects:delete.archiving") : t("projects:delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, FolderGit2, Search, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, useArchiveProject } from "../projects.queries";
import { ProjectFormDialog } from "../components/ProjectFormDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import { Skeleton } from "../../../components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import type { ProjectResponse } from "../projects.types";
import { useProjectStore } from "../project.store";
import { useNavigate, useSearchParams } from "react-router-dom";

export function ProjectListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchString = searchParams.get("search") || "";
  const isEmptyParam = searchParams.get("empty") === "1";
  const isNewParam = searchParams.get("action") === "new";

  const { data, isLoading } = useProjects({ search: searchString });
  const archiveMutation = useArchiveProject();
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const [isFormOpen, setIsFormOpen] = useState(isEmptyParam || isNewParam);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);

  // Sync form open state with URL
  useEffect(() => {
    if (isFormOpen && !isEmptyParam && !isNewParam) {
      // User opened manually
    } else if (!isFormOpen && (isEmptyParam || isNewParam)) {
      // User closed the form, remove params
      setSearchParams(prev => {
        prev.delete("empty");
        prev.delete("action");
        return prev;
      }, { replace: true });
    }
  }, [isFormOpen, isEmptyParam, isNewParam, setSearchParams]);

  const projects = data?.content || [];
  const isEmpty = !isLoading && projects.length === 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchParams(prev => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    }, { replace: true });
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: ProjectResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("projects:delete.desc"))) {
      archiveMutation.mutate(id);
    }
  };

  const handleSelectProject = (id: string) => {
    setActiveProject(id);
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("projects:title")}</h1>
          <p className="text-muted-foreground mt-1">Manage your workspaces and API testing environments.</p>
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
            <FolderGit2 className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("projects:empty.title")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">{t("projects:empty.desc")}</p>
          <Button onClick={handleCreate} size="lg" className="rounded-full gap-2">
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
                  className="group relative flex flex-col bg-white dark:bg-zinc-950 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
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
                        <DropdownMenuItem onClick={(e) => handleEdit(project, e as any)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t("projects:form.editTitle")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleArchive(project.id, e as any)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("projects:delete.confirm")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-lg font-medium tracking-tight mb-1">{project.name}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 flex-1">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
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
    </div>
  );
}

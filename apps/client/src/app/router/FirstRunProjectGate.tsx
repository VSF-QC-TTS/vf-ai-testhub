import { AlertTriangle, FolderKanban } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Navigate, Outlet, Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "../../features/projects/project.store";
import { useProjects } from "../../features/projects/projects.queries";
import { findProject, projectOverviewPath } from "../../features/projects/project.routes";

export function FirstRunProjectGate() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const location = useLocation();
  const lastProjectId = useProjectStore((state) => state.lastProjectId);
  const setLastProject = useProjectStore((state) => state.setLastProject);
  const { data, isLoading, isError } = useProjects();
  const projects = useMemo(() => data?.content ?? [], [data?.content]);

  useEffect(() => {
    if (projectId && projectId !== lastProjectId && projects.some((project) => project.id === projectId)) {
      setLastProject(projectId);
    }
  }, [lastProjectId, projectId, projects, setLastProject]);

  if (isLoading) {
    return <ProjectGateSkeleton />;
  }

  if (isError) {
    return (
      <ProjectGateState
        icon={<AlertTriangle className="h-6 w-6" />}
        title={t("projects:gate.errorTitle")}
        description={t("projects:gate.errorDesc")}
        action={<Button asChild><Link to="/projects">{t("projects:switcher.manage")}</Link></Button>}
      />
    );
  }

  if (projects.length === 0) {
    return <Navigate to="/projects/new" replace state={{ from: location }} />;
  }

  if (!projectId) {
    const fallbackProject = findProject(projects, lastProjectId) ?? projects[0];
    return <Navigate to={projectOverviewPath(fallbackProject.id)} replace />;
  }

  const currentProject = findProject(projects, projectId);
  if (!currentProject) {
    return (
      <ProjectGateState
        icon={<AlertTriangle className="h-6 w-6" />}
        title={t("projects:gate.staleTitle")}
        description={t("projects:gate.staleDesc")}
        action={<Button asChild><Link to="/projects">{t("projects:gate.manageCta")}</Link></Button>}
      />
    );
  }

  return <Outlet />;
}

function ProjectGateSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}

interface ProjectGateStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}

function ProjectGateState({ icon, title, description, action }: ProjectGateStateProps) {
  return (
    <div className="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed bg-surface p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon || <FolderKanban className="h-6 w-6" />}
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

import { Database, FileText, PlayCircle, Target } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTargets } from "../../targets/targets.queries";
import { projectModulePath, projectTargetsPath } from "../project.routes";
import { useProject } from "../projects.queries";

export function ProjectOverviewPage() {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: targetsData, isLoading: isTargetsLoading } = useTargets(projectId);
  const targetCount = targetsData?.content.length ?? 0;

  if (isProjectLoading) {
    return (
      <div className="mt-8 space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("projects:overview.eyebrow")}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{project?.name}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {project?.description || t("projects:list.noDescription")}
          </p>
        </div>
        <Button asChild>
          <Link to={projectTargetsPath(projectId)}>
            <Target className="h-4 w-4" />
            {targetCount > 0 ? t("projects:overview.manageTargets") : t("projects:overview.createTarget")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SetupCard
          icon={<Target className="h-5 w-5" />}
          title={t("targets:title")}
          value={isTargetsLoading ? t("common:loading") : t("projects:overview.targetCount", { count: targetCount })}
          to={projectTargetsPath(projectId)}
        />
        <SetupCard
          icon={<Database className="h-5 w-5" />}
          title={t("datasets:title")}
          value={t("projects:overview.notConfigured")}
          to={projectModulePath(projectId, "datasets")}
        />
        <SetupCard
          icon={<FileText className="h-5 w-5" />}
          title={t("testCases:title")}
          value={t("projects:overview.notConfigured")}
          to={projectModulePath(projectId, "test-cases")}
        />
        <SetupCard
          icon={<PlayCircle className="h-5 w-5" />}
          title={t("runs:title")}
          value={t("projects:overview.notConfigured")}
          to={projectModulePath(projectId, "runs")}
        />
      </div>
    </div>
  );
}

interface SetupCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  to: string;
}

function SetupCard({ icon, title, value, to }: SetupCardProps) {
  return (
    <Link
      to={to}
      className="rounded-lg border bg-surface p-4 transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{value}</p>
    </Link>
  );
}

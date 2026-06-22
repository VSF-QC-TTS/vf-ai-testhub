import { Database, FileText, PlayCircle, Target, ArrowRight, BarChart3 } from "lucide-react";
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

  // For now, simulate dataset and run counts as 0 since their features are PENDING
  const datasetCount = 0;
  const runCount = 0;

  if (isProjectLoading || isTargetsLoading) {
    return (
      <div className="mt-8 space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  // Handle Progressive Setup States based on Frontend_Design_System rules
  const renderSetupState = () => {
    if (targetCount === 0) {
      return (
        <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 dark:opacity-20" />
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-950/50 dark:border dark:border-zinc-800 shadow-sm">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("projects:overview.setup.target.title")}</h2>
          <p className="max-w-sm text-zinc-500 mb-8">
            {t("projects:overview.setup.target.description")}
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to={`${projectTargetsPath(projectId)}/new`}>
              <Target className="h-4 w-4" />
              {t("projects:overview.createTarget")}
            </Link>
          </Button>
        </div>
      );
    }

    if (datasetCount === 0) {
      return (
        <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 dark:opacity-20" />
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-950/50 dark:border dark:border-zinc-800 shadow-sm">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("projects:overview.setup.dataset.title")}</h2>
          <p className="max-w-sm text-zinc-500 mb-8">
            {t("projects:overview.setup.dataset.description")}
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to={projectModulePath(projectId, "datasets")}>
              <Database className="h-4 w-4" />
              {t("projects:overview.setup.dataset.action")}
            </Link>
          </Button>
        </div>
      );
    }

    if (runCount === 0) {
      return (
        <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 dark:opacity-20" />
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-950/50 dark:border dark:border-zinc-800 shadow-sm">
            <PlayCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("projects:overview.setup.run.title")}</h2>
          <p className="max-w-sm text-zinc-500 mb-8">
            {t("projects:overview.setup.run.description")}
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to={projectModulePath(projectId, "runs")}>
              <PlayCircle className="h-4 w-4" />
              {t("projects:overview.setup.run.action")}
            </Link>
          </Button>
        </div>
      );
    }

    // Dashboard content (when runs exist)
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <BarChart3 className="h-8 w-8 text-zinc-400" />
        </div>
        <h2 className="text-xl font-medium mb-2">{t("projects:overview.setup.dashboard.title")}</h2>
        <p className="max-w-sm text-zinc-500">
          {t("projects:overview.setup.dashboard.description")}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-8 flex flex-col gap-8 w-full pb-12">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{t("projects:overview.eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{project?.name}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {project?.description || t("projects:list.noDescription")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={projectModulePath(projectId, "settings")}>
            {t("projects:overview.settings")}
          </Link>
        </Button>
      </div>

      {renderSetupState()}

      <div>
        <h3 className="text-lg font-medium tracking-tight mb-4">{t("projects:overview.resources")}</h3>
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
      className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-950/50 dark:border dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:scale-110 group-hover:text-primary transition-all">
        {icon}
      </div>
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{value}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-x-1" />
      </div>
    </Link>
  );
}

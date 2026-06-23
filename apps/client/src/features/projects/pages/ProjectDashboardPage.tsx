import { Database, FileText, Target, CheckSquare, Settings2, FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTargets } from "../../targets/targets.queries";
import { useDatasets } from "../../datasets/datasets.queries";
import { useProjectRubrics } from "../../rubrics/rubrics.api";
import { projectModulePath, projectTargetsPath } from "../project.routes";
import { useProject } from "../projects.queries";

export function ProjectDashboardPage() {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();
  
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: targetsData, isLoading: isTargetsLoading } = useTargets(projectId, { size: 100 });
  const { data: datasetsData, isLoading: isDatasetsLoading } = useDatasets(projectId, { size: 100 });
  const { data: rubricsData, isLoading: isRubricsLoading } = useProjectRubrics(projectId, { size: 100 });

  const targetCount = targetsData?.totalElements ?? 0;
  const datasetCount = datasetsData?.totalElements ?? 0;
  const rubricCount = rubricsData?.totalElements ?? 0;
  const testCaseCount = datasetsData?.content.reduce((acc, dataset) => acc + (dataset.testCaseCount || 0), 0) ?? 0;

  const isLoading = isProjectLoading || isTargetsLoading || isDatasetsLoading || isRubricsLoading;

  if (isLoading) {
    return (
      <div className="mt-8 space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  // Handle Progressive Setup States
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

    // Fully Setup Dashboard
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <DashboardMetricCard
            title={t("projects:overview.metrics.totalTestCases", "Total Test Cases")}
            value={testCaseCount.toString()}
            icon={<FileText className="h-5 w-5 text-zinc-500" />}
          />
          <DashboardMetricCard
            title={t("projects:overview.metrics.activeTargets", "Active Targets")}
            value={targetCount.toString()}
            icon={<Target className="h-5 w-5 text-zinc-500" />}
          />
          <DashboardMetricCard
            title={t("projects:overview.metrics.datasets", "Datasets")}
            value={datasetCount.toString()}
            icon={<Database className="h-5 w-5 text-zinc-500" />}
          />
          <DashboardMetricCard
            title={t("projects:overview.metrics.rubrics", "Rubrics")}
            value={rubricCount.toString()}
            icon={<CheckSquare className="h-5 w-5 text-zinc-500" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-800 p-6 shadow-sm flex flex-col h-[300px]">
            <div className="flex items-center gap-2 mb-6">
              <FlaskConical className="h-5 w-5 text-zinc-400" />
              <h3 className="font-medium">{t("experiments.title", "A/B Experiments")}</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-zinc-500 mb-4 max-w-[250px]">
                {t("experiments.empty.description", "Start an A/B experiment to compare different targets, models, or configurations.")}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to={projectModulePath(projectId, "experiments")}>
                  {t("projects:overview.viewExperiments", "View Experiments")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-800 p-6 shadow-sm flex flex-col h-[300px]">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="h-5 w-5 text-zinc-400" />
              <h3 className="font-medium">{t("projects:overview.configSummary", "Configuration")}</h3>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                <span className="text-sm text-zinc-500">{t("projects:overview.targetsConfigured", "Targets Configured")}</span>
                <span className="font-medium">{targetCount}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                <span className="text-sm text-zinc-500">{t("projects:overview.datasetsImported", "Datasets Imported")}</span>
                <span className="font-medium">{datasetCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">{t("projects:overview.rubricsDefined", "Rubrics Defined")}</span>
                <span className="font-medium">{rubricCount}</span>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}

interface DashboardMetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

function DashboardMetricCard({ title, value, icon }: DashboardMetricCardProps) {
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

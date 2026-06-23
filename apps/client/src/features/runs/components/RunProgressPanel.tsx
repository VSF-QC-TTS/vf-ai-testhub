import { useTranslation } from "react-i18next";
import { useRunPolling } from "../runs.queries";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { motion } from "framer-motion";

import { Link, useParams } from "react-router-dom";

interface RunProgressPanelProps {
  runId: string;
}

export function RunProgressPanel({ runId }: RunProgressPanelProps) {
  const { t } = useTranslation();
  const { projectId = "" } = useParams();
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useRunPolling(runId);
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();

  if (isLoading && !data) {
    return (
      <div className="p-6 border rounded-lg bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">{t("runs:progress.error")}</h3>
        </div>
        <p className="text-sm">{t("runs:progress.errorDesc")}</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
          <RotateCw className="h-4 w-4 mr-2" />
          {t("common:actions.retry")}
        </Button>
      </div>
    );
  }

  const isTerminal = data.status === "COMPLETED" || data.status === "FAILED" || data.status === "CANCELLED";
  const progressPercent = (data.totalTestCases || 0) > 0 ? Math.round(((data.completedTestCases || 0) / (data.totalTestCases || 0)) * 100) : 0;

  return (
    <div className="border rounded-xl bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold">{t("runs:progress.title")}</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {data.status === "RUNNING" && <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />}
              {data.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              {data.status === "FAILED" && <XCircle className="h-3 w-3 text-red-500" />}
              {t(`runs:status.${data.status}`, { defaultValue: data.status })}
            </div>
            
          </div>
          <p className="text-sm text-muted-foreground">
            {t("runs:progress.lastUpdated", { time: lastUpdated.toLocaleTimeString() })}
            {!isTerminal && (
              <Button variant="link" size="sm" onClick={() => refetch()} className="h-auto p-0 ml-2 text-indigo-600">
                {t("runs:progress.refresh")}
              </Button>
            )}
          </p>
        </div>
        
        {isTerminal && (
          <Button asChild className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link to={`/projects/${projectId}/reports/${runId}`}>
              {t("runs:progress.viewReport")}
            </Link>
          </Button>
        )}
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-xs text-muted-foreground mb-1">{t("runs:progress.progress")}</p>
            <p className="text-xl font-semibold">{(data.completedTestCases || 0)} <span className="text-sm text-muted-foreground font-normal">/ {(data.totalTestCases || 0)}</span></p>
          </div>
          <div className="p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/50">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t("runs:progress.failed")}</p>
            <p className="text-xl font-semibold text-green-700 dark:text-green-500">{(data.totalTestCases || 0) - (data.failedCount || 0) - (data.errorCount || 0) - 0 - (data.skippedCount || 0)}</p>
          </div>
          <div className="p-3 border rounded-lg bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">{t("runs:progress.failed")}</p>
            <p className="text-xl font-semibold text-red-700 dark:text-red-500">{(data.failedCount || 0)}</p>
          </div>
          <div className="p-3 border rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/50">
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t("runs:progress.error")}</p>
            <p className="text-xl font-semibold text-orange-700 dark:text-orange-500">{(data.errorCount || 0)}</p>
          </div>
          <div className="p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/50">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">{t("runs:progress.uncertain")}</p>
            <p className="text-xl font-semibold text-amber-700 dark:text-amber-500">{0}</p>
          </div>
          <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-xs text-muted-foreground mb-1">{t("runs:progress.elapsed")}</p>
            <p className="text-xl font-semibold">{data.startedAt && data.finishedAt ? `${(new Date(data.finishedAt).getTime() - new Date(data.startedAt).getTime()) / 1000}s` : "-"}</p>
          </div>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden border dark:border-zinc-700 relative">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-indigo-600 h-2.5 rounded-full w-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progressPercent / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        </div>
    </div>
  );
}

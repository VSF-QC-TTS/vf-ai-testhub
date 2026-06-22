import { useTranslation } from "react-i18next";
import { useRunPolling } from "../runs.queries";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import type { ReviewStatus } from "@/lib/api/types";

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
  const progressPercent = data.totalCases > 0 ? Math.round((data.completedCases / data.totalCases) * 100) : 0;

  const renderStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case "PASSED": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "FAILED": return <XCircle className="h-4 w-4 text-red-500" />;
      case "ERROR": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "UNCERTAIN": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />;
    }
  };

  const renderStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "PASSED":
        return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-500/20">{t("status.PASSED", { defaultValue: "PASSED" })}</span>;
      case "FAILED":
        return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-500/20">{t("status.FAILED", { defaultValue: "FAILED" })}</span>;
      case "ERROR":
        return <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/30 dark:bg-red-950 dark:text-red-300 dark:ring-red-500/30">{t("status.ERROR", { defaultValue: "ERROR" })}</span>;
      case "UNCERTAIN":
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/10 dark:text-amber-400 dark:ring-amber-500/20">{t("status.UNCERTAIN", { defaultValue: "UNCERTAIN" })}</span>;
      case "SKIPPED":
        return <span className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-900/10 dark:text-zinc-400 dark:ring-zinc-500/20">{t("status.SKIPPED", { defaultValue: "SKIPPED" })}</span>;
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>;
    }
  };

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
            {data.currentPhase && (
              <span className="text-xs text-muted-foreground capitalize">{data.currentPhase.replace(/_/g, " ")}</span>
            )}
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
            <p className="text-xl font-semibold">{data.completedCases} <span className="text-sm text-muted-foreground font-normal">/ {data.totalCases}</span></p>
          </div>
          <div className="p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/50">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t("runs:progress.failed")}</p>
            <p className="text-xl font-semibold text-green-700 dark:text-green-500">{data.totalCases - data.failedCases - data.errorCases - data.uncertainCases - data.skippedCases}</p>
          </div>
          <div className="p-3 border rounded-lg bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">{t("runs:progress.failed")}</p>
            <p className="text-xl font-semibold text-red-700 dark:text-red-500">{data.failedCases}</p>
          </div>
          <div className="p-3 border rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/50">
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t("runs:progress.error")}</p>
            <p className="text-xl font-semibold text-orange-700 dark:text-orange-500">{data.errorCases}</p>
          </div>
          <div className="p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/50">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">{t("runs:progress.uncertain")}</p>
            <p className="text-xl font-semibold text-amber-700 dark:text-amber-500">{data.uncertainCases}</p>
          </div>
          <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-xs text-muted-foreground mb-1">{t("runs:progress.elapsed")}</p>
            <p className="text-xl font-semibold">{data.elapsedMs ? `${(data.elapsedMs / 1000).toFixed(1)}s` : "-"}</p>
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

        {data.cases && data.cases.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-3">{t("runs:progress.recentCases")}</h3>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[100px]">{t("runs:progress.extId")}</TableHead>
                    <TableHead>{t("runs:progress.input")}</TableHead>
                    <TableHead className="w-[100px]">{t("runs:progress.latency")}</TableHead>
                    <TableHead className="w-[120px]">{t("runs:progress.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                                      {data.cases.map(c => (
                      <TableRow key={c.testCasePublicId}>
                        <TableCell className="text-center">{renderStatusIcon(c.status)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{c.externalId || "-"}</TableCell>
                        <TableCell>
                          <div className="truncate max-w-[300px] text-sm" title={c.input}>{c.input}</div>
                          {c.failureReason && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate max-w-[300px]" title={c.failureReason}>
                              {c.failureReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {c.latencyMs ? `${c.latencyMs}ms` : "-"}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(c.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                                  </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

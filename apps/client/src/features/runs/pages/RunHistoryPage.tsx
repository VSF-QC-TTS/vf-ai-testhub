import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useRuns } from "../runs.queries";
import { Clock } from "lucide-react";
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
import type { RunStatus } from "@/lib/api/types";

export function RunHistoryPage() {
  const { t } = useTranslation();
  const { projectId = "", datasetId = "" } = useParams();

  const { data, isLoading } = useRuns(datasetId);

  const runs = data?.content || [];
  const isEmpty = !isLoading && runs.length === 0;

  const renderStatusBadge = (status: RunStatus) => {
    switch (status) {
      case "COMPLETED":
        return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{t("runs:status.COMPLETED")}</span>;
      case "FAILED":
        return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">{t("runs:status.FAILED")}</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">{t("runs:status.CANCELLED")}</span>;
      case "RUNNING":
        return <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">{t("runs:status.RUNNING")}</span>;
      case "PENDING":
        return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">{t("runs:status.PENDING")}</span>;
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>;
    }
  };

  if (!datasetId) {
    return <div className="p-8 text-center text-muted-foreground">Missing dataset ID</div>;
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("runs:history.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("runs:history.description")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="rounded-lg border">
            <div className="h-12 border-b px-4 flex items-center"><Skeleton className="h-5 w-full" /></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 border-b px-4 flex items-center"><Skeleton className="h-5 w-full" /></div>
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
            <Clock className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">{t("runs:history.noRuns")}</h2>
          <p className="text-zinc-500 max-w-sm mb-8">{t("runs:history.noRunsDesc")}</p>
        </motion.div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/50 sticky top-0">
              <TableRow>
                <TableHead>{t("runs:history.runId")}</TableHead>
                <TableHead>{t("runs:history.status")}</TableHead>
                <TableHead>{t("runs:history.mode")}</TableHead>
                <TableHead>{t("runs:history.cases")}</TableHead>
                <TableHead>{t("runs:history.passed")}</TableHead>
                <TableHead>{t("runs:history.failed")}</TableHead>
                <TableHead>{t("runs:history.date")}</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.publicId} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {run.publicId.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(run.status)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {t(`runs:modes.${run.runMode}`, { defaultValue: run.runMode })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {run.totalCases}
                  </TableCell>
                  <TableCell className="text-sm text-green-600 font-medium">
                    {run.totalCases - run.failedCases - run.errorCases - run.uncertainCases - run.skippedCases}
                  </TableCell>
                  <TableCell className="text-sm text-red-600 font-medium">
                    {run.failedCases + run.errorCases}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(run.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/projects/${projectId}/reports/${run.publicId}`}>
                        {t("runs:history.viewReport")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

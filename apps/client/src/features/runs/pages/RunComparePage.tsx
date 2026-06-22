import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCompareRuns } from "../runs.queries";
import { RunComparisonSummaryPanel } from "../../experiments/components/RunComparisonSummaryPanel";
import { ComparisonResultFieldDiff } from "../../experiments/components/ComparisonResultFieldDiff";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const getErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return undefined;
  }

  const response = error.response as { data?: { message?: string } } | undefined;
  return response?.data?.message;
};

export function RunComparePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const baseRunId = searchParams.get("baseRunId");
  const candidateRunId = searchParams.get("candidateRunId");

  const { data, isLoading, error } = useCompareRuns(baseRunId, candidateRunId);

  return (
    <div className="mt-8 flex flex-col gap-8 w-full pb-12">
      <div className="flex flex-col gap-4 border-b pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t("compare.title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("compare.selectRuns")}
        </p>
      </div>

      {!baseRunId || !candidateRunId ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Run IDs</AlertTitle>
          <AlertDescription>
            Please provide both baseRunId and candidateRunId in the URL parameters to compare runs.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error) || t("errors.unknown")}
          </AlertDescription>
        </Alert>
      ) : data ? (
        <div className="space-y-8">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col border rounded-md p-4 bg-muted/20 w-1/2">
              <span className="text-sm font-medium text-muted-foreground">{t("compare.baseRun")}</span>
              <span className="font-semibold text-lg">{data.baseRun.targetName}</span>
              <span className="text-sm text-muted-foreground">{data.baseRun.datasetName}</span>
            </div>
            <div className="flex flex-col border rounded-md p-4 bg-muted/20 w-1/2">
              <span className="text-sm font-medium text-muted-foreground">{t("compare.candidateRun")}</span>
              <span className="font-semibold text-lg">{data.candidateRun.targetName}</span>
              <span className="text-sm text-muted-foreground">{data.candidateRun.datasetName}</span>
            </div>
          </div>
          
          <RunComparisonSummaryPanel summary={data.summary} />
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Test Case Differences</h3>
            {data.diffs?.filter(d => d.assertionDiffs && d.assertionDiffs.length > 0).map((diff) => (
              <div key={diff.testCasePublicId} className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate max-w-[70%]">
                    {diff.testCaseName || diff.testCaseInput || diff.testCasePublicId}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    diff.statusShift === "REGRESSION" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : 
                    diff.statusShift === "FIX" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                    "bg-muted"
                  }`}>
                    {diff.statusShift}
                  </span>
                </div>
                <div className="space-y-2">
                  {diff.assertionDiffs?.map((ad) => (
                    <ComparisonResultFieldDiff key={ad.assertionPublicId} diff={ad} />
                  ))}
                </div>
              </div>
            ))}
            {data.diffs?.filter(d => d.assertionDiffs && d.assertionDiffs.length > 0).length === 0 && (
              <div className="text-center p-8 border rounded-md text-muted-foreground">
                {t("compare.metrics.unchanged")}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

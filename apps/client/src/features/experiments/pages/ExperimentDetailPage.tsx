import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useExperiment, useStartExperiment, useExperimentComparison } from "../experiments.queries";
import { RunComparisonSummaryPanel } from "../components/RunComparisonSummaryPanel";
import { Skeleton } from "@/components/ui/skeleton";

export function ExperimentDetailPage() {
  const { t } = useTranslation();
  const { experimentId = "" } = useParams();
  
  const { data: experiment, isLoading: isLoadingExp } = useExperiment(experimentId);
  const startMutation = useStartExperiment(experimentId);
  
  const { data: comparison, isLoading: isLoadingComp } = useExperimentComparison(
    experiment?.status === "COMPLETED" ? experimentId : null
  );

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync();
      toast.success("Experiment started successfully");
    } catch {
      toast.error("Failed to start experiment");
    }
  };

  if (isLoadingExp) {
    return (
      <div className="mt-8 space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!experiment) {
    return <div className="mt-8 text-center text-muted-foreground">Experiment not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 mt-8 pb-12">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{experiment.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{experiment.description || "No description provided"}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            experiment.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
            experiment.status === "FAILED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
            "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
          }`}>
            {experiment.status}
          </span>
          {experiment.status === "DRAFT" && (
            <Button onClick={handleStart} disabled={startMutation.isPending}>
              <Play className="mr-2 h-4 w-4" />
              {startMutation.isPending ? t("experiments.form.starting") : t("experiments.form.startBtn")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t("experiments.form.variants")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiment.variants.map((v) => (
            <div key={v.publicId} className="border p-4 rounded-md shadow-sm bg-card">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="font-medium text-lg">{v.name}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded font-mono">{v.variantKey}</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm"><span className="text-muted-foreground">Target:</span> <span className="font-medium">{v.targetName}</span></div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">Run Status:</span> 
                  <span className={`text-xs font-semibold ${
                    v.runStatus === "COMPLETED" ? "text-green-600 dark:text-green-400" :
                    v.runStatus === "FAILED" ? "text-red-600 dark:text-red-400" :
                    "text-zinc-600 dark:text-zinc-400"
                  }`}>
                    {v.runStatus || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {experiment.status === "COMPLETED" && (
        <div className="space-y-4 mt-8 border-t pt-8">
          <h3 className="font-semibold text-xl">Results & Comparison</h3>
          {isLoadingComp ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : comparison ? (
            <RunComparisonSummaryPanel summary={comparison.summary} />
          ) : (
            <div className="text-center p-8 border rounded-md text-muted-foreground bg-muted/20">
              {t("experiments.detail.noWinnerYet")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

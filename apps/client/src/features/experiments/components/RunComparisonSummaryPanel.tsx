import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RunComparisonSummary } from "../../runs/runs.types";

interface RunComparisonSummaryProps {
  summary: RunComparisonSummary;
}

export function RunComparisonSummaryPanel({ summary }: RunComparisonSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("compare.metrics.regressions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{summary.regressions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("compare.metrics.fixes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{summary.fixes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("compare.metrics.unchanged")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.unchanged}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("compare.metrics.passRateDelta")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.passRateDelta !== undefined ? `${summary.passRateDelta > 0 ? "+" : ""}${(summary.passRateDelta * 100).toFixed(1)}%` : "-"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("compare.metrics.latencyDelta")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.averageLatencyDeltaMs !== undefined ? `${summary.averageLatencyDeltaMs > 0 ? "+" : ""}${summary.averageLatencyDeltaMs}ms` : "-"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("compare.metrics.costDelta")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            -
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

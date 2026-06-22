import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import type { AssertionComparisonDiff } from "../../runs/runs.types";

interface ComparisonResultFieldDiffProps {
  diff: AssertionComparisonDiff;
}

export function ComparisonResultFieldDiff({ diff }: ComparisonResultFieldDiffProps) {
  const { t } = useTranslation();

  return (
    <Card className="shadow-none">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{diff.fieldPath || "Assertion"}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t("compare.diff.expected")}</span>
            <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap font-mono">
              {diff.expectedValue || "N/A"}
            </pre>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              {t("compare.diff.actualBase")} - <span className="font-bold">{diff.baseStatus}</span>
            </span>
            <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap font-mono">
              {diff.baseActualValue || "N/A"}
            </pre>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              {t("compare.diff.actualCandidate")} - <span className="font-bold">{diff.candidateStatus}</span>
            </span>
            <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap font-mono">
              {diff.candidateActualValue || "N/A"}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

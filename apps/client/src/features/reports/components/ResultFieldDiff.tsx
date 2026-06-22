import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import type { AssertionResultResponse } from '../reports.types';
import { formatExpectedValue } from '@/features/assertions/assertions.ui';

interface ResultFieldDiffProps {
  assertion: AssertionResultResponse;
}

export function ResultFieldDiff({ assertion }: ResultFieldDiffProps) {
  const { t } = useTranslation();
  const type = typeof assertion.metadata?.type === 'string' ? assertion.metadata.type : null;
  const scope = typeof assertion.metadata?.scope === 'string' ? assertion.metadata.scope : null;
  const operatorLabel = type ? t(`assertions:types.${type}`, type) : t('report.assertion', 'Assertion');

  return (
    <Card className="shadow-none">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{operatorLabel}</span>
              {scope ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {scope}
                </span>
              ) : null}
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {assertion.severity}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{assertion.reason || t('report.assertionReasonFallback', 'Runner did not provide a detailed reason.')}</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-muted rounded-md">{assertion.status}</span>
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{t('report.expectedCondition', 'Expected condition')}:</span>{' '}
          {type === 'between' && Array.isArray(assertion.expectedValue)
            ? `${operatorLabel} ${assertion.expectedValue[0]} - ${assertion.expectedValue[1]}`
            : `${operatorLabel} ${formatExpectedValue(assertion.expectedValue)}`}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('report.expected', 'Expected')}</span>
            <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap font-mono">
              {JSON.stringify(assertion.expectedValue, null, 2) || 'N/A'}
            </pre>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">{t('report.actual', 'Actual')}</span>
            <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap font-mono">
              {JSON.stringify(assertion.actualValue, null, 2) || 'N/A'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

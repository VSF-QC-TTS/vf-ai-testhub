import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import type { AssertionResultResponse } from '../reports.types';

interface ResultFieldDiffProps {
  assertion: AssertionResultResponse;
}

export function ResultFieldDiff({ assertion }: ResultFieldDiffProps) {
  const { t } = useTranslation();

  return (
    <Card className="shadow-none">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{assertion.reason || t('report.assertion', 'Assertion')}</span>
          <span className="text-xs font-bold px-2 py-1 bg-muted rounded-md">{assertion.status}</span>
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, AlertTriangle, Activity } from 'lucide-react';

interface SummaryCardsProps {
  total: number;
  passed: number;
  failed: number;
  error: number;
  skipped: number;
  uncertain: number;
  passRate: number;
}

export function SummaryCards({ total, passed, failed, error, skipped, uncertain, passRate }: SummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('report.passRate', 'Pass Rate')}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Number(passRate).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {t('report.totalCases', '{{total}} total cases', { total })}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('report.passed', 'Passed')}</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{passed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('report.failed', 'Failed')}</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{failed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('report.issues', 'Issues')}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <div className="text-xl font-bold text-destructive">{error}</div>
              <p className="text-xs text-muted-foreground">{t('report.error', 'Error')}</p>
            </div>
            <div>
              <div className="text-xl font-bold text-warning">{uncertain}</div>
              <p className="text-xs text-muted-foreground">{t('report.uncertain', 'Uncertain')}</p>
            </div>
            <div>
              <div className="text-xl font-bold text-muted-foreground">{skipped}</div>
              <p className="text-xs text-muted-foreground">{t('report.skipped', 'Skipped')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

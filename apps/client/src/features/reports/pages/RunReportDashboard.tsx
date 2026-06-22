import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRunReport } from '../reports.queries';
import { SummaryCards } from '../components/SummaryCards';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ResultsTable } from '../components/ResultsTable';

export function RunReportDashboard() {
  const { runId } = useParams<{ runId: string }>();
  const { t } = useTranslation();
  const { data: report, isLoading, isError, refetch, isFetching } = useRunReport(runId || '');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium">{t('report.error.title', 'Failed to load report')}</h3>
        <p className="text-muted-foreground">{t('report.error.description', 'Could not load the run report.')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('report.title', 'Run Report')}</h1>
          <p className="text-muted-foreground">
            {t('report.subtitle', 'Review the execution results and metrics.')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {t('report.refresh', 'Refresh')}
        </Button>
      </div>

      <SummaryCards 
        total={report.total}
        passed={report.passed}
        failed={report.failed}
        error={report.error}
        skipped={report.skipped}
        uncertain={report.uncertain}
        passRate={report.passRate}
      />

      <div className="mt-8">
        <ResultsTable results={report.results} runId={runId || ''} />
      </div>
    </div>
  );
}

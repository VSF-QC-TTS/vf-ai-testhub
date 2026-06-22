import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TestResultReportItem } from '../reports.types';
import { ResultFieldDiff } from './ResultFieldDiff';
import { ManualReviewForm } from './ManualReviewForm';
import { JsonViewer } from '@/components/ui/JsonViewer';

interface ResultDetailDrawerProps {
  result: TestResultReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  runId: string;
}

export function ResultDetailDrawer({ result, isOpen, onClose, runId }: ResultDetailDrawerProps) {
  const { t } = useTranslation();

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{result.testCaseName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <Tabs defaultValue="diffs">
            <TabsList className="mb-4">
              <TabsTrigger value="diffs">{t('report.tabs.diffs', 'Expected vs Actual')}</TabsTrigger>
              <TabsTrigger value="raw">{t('report.tabs.raw', 'Raw Payloads')}</TabsTrigger>
              <TabsTrigger value="review">{t('report.tabs.review', 'Manual Review')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="diffs" className="space-y-4">
               {result.assertionResults?.map((assertion) => (
                 <ResultFieldDiff key={assertion.publicId} assertion={assertion} />
               ))}
               {result.assertionResults?.length === 0 && (
                 <p className="text-muted-foreground">{t('report.noAssertions', 'No assertions defined for this test case.')}</p>
               )}
            </TabsContent>

            <TabsContent value="raw" className="space-y-4">
               <div className="space-y-2">
                 <h4 className="font-medium text-sm">{t('report.rawRequest', 'Raw Request')}</h4>
                 <JsonViewer data={result.requestSnapshot} />
               </div>
               <div className="space-y-2">
                 <h4 className="font-medium text-sm">{t('report.rawResponse', 'Raw Response')}</h4>
                 <JsonViewer data={result.rawResponse} />
               </div>
            </TabsContent>

            <TabsContent value="review">
               <ManualReviewForm result={result} runId={runId} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

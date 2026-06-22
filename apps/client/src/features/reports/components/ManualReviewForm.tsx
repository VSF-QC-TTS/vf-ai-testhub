import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitManualReview } from '../reports.queries';
import type { TestResultReportItem, ReviewStatus } from '../reports.types';
import { useState } from 'react';

interface ManualReviewFormProps {
  result: TestResultReportItem;
  runId: string;
}

export function ManualReviewForm({ result, runId }: ManualReviewFormProps) {
  const { t } = useTranslation();
  const submitReview = useSubmitManualReview(runId);
  const [status, setStatus] = useState<ReviewStatus>(result.finalStatus);
  const [note, setNote] = useState(result.manualReview?.reviewerNote || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview.mutate(
      {
        reviews: [{ testResultId: result.publicId, reviewedStatus: status, reviewerNote: note }]
      },
      {
        onSuccess: () => {
          toast.success(t('report.review.success', 'Review submitted successfully'));
        },
        onError: () => {
          toast.error(t('report.review.error', 'Failed to submit review'));
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">{t('report.review.status', 'Review Status')}</Label>
        <Select value={status} onValueChange={(val: ReviewStatus) => setStatus(val)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PASSED">PASSED</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
            <SelectItem value="SKIPPED">SKIPPED</SelectItem>
            <SelectItem value="UNCERTAIN">UNCERTAIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">{t('report.review.note', 'Reviewer Note')}</Label>
        <Textarea 
          id="note" 
          value={note} 
          onChange={e => setNote(e.target.value)}
          placeholder={t('report.review.notePlaceholder', 'Explain why you are overriding the status...')}
        />
      </div>

      <Button type="submit" disabled={submitReview.isPending}>
        {submitReview.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save Review')}
      </Button>
    </form>
  );
}

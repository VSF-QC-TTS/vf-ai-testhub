import { useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import type { TestResultReportItem } from '../reports.types';
import { ResultDetailDrawer } from './ResultDetailDrawer';
import { ResultFieldDiff } from './ResultFieldDiff';

interface ResultsTableProps {
  results: TestResultReportItem[];
  runId: string;
}

export function ResultsTable({ results, runId }: ResultsTableProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedResult, setSelectedResult] = useState<TestResultReportItem | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const searchQuery = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'ALL';

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const filteredResults = results.filter(r => {
    const matchesSearch = r.testCaseName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.sectionName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.finalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input 
          placeholder={t('report.search', 'Search test cases or sections...')} 
          value={searchQuery}
          onChange={(e) => updateSearchParam('q', e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(val) => updateSearchParam('status', val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('report.filterStatus', 'Filter by Status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('report.status.all', 'All Statuses')}</SelectItem>
            <SelectItem value="PASSED">PASSED</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
            <SelectItem value="UNCERTAIN">UNCERTAIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>{t('report.table.name', 'Name')}</TableHead>
              <TableHead>{t('report.table.section', 'Section')}</TableHead>
              <TableHead>{t('report.table.status', 'Status')}</TableHead>
              <TableHead>{t('report.table.latency', 'Latency')}</TableHead>
              <TableHead className="text-right">{t('report.table.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('report.table.noResults', 'No results found.')}
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((result) => (
                <Fragment key={result.publicId}>
                  <TableRow className={result.finalStatus === 'FAILED' ? 'bg-destructive/5' : ''}>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleRow(result.publicId)} className="h-6 w-6">
                        {expandedRows[result.publicId] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium cursor-pointer" onClick={() => setSelectedResult(result)}>
                      {result.testCaseName}
                    </TableCell>
                    <TableCell>{result.sectionName || '-'}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
                        result.finalStatus === 'PASSED' ? 'bg-success/20 text-success' :
                        result.finalStatus === 'FAILED' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {t(`status.${result.finalStatus}`, result.finalStatus)}
                      </span>
                    </TableCell>
                    <TableCell>{result.latencyMs ? `${result.latencyMs}ms` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                        {t('report.table.view', 'View Details')}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows[result.publicId] && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={6} className="p-0 border-b">
                        <div className="p-4 pl-14 space-y-3">
                          {result.assertionResults?.filter(a => a.status === 'FAILED').length > 0 ? (
                            result.assertionResults.filter(a => a.status === 'FAILED').map(assertion => (
                              <ResultFieldDiff key={assertion.publicId} assertion={assertion} />
                            ))
                          ) : (
                            <div className="flex items-center text-muted-foreground text-sm">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              {t('report.noFailedAssertions', 'No specific failed assertions to display inline. Click View Details.')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ResultDetailDrawer 
        result={selectedResult} 
        isOpen={!!selectedResult} 
        onClose={() => setSelectedResult(null)} 
        runId={runId} 
      />
    </div>
  );
}

import { http, HttpResponse, delay } from 'msw';
import { mockReport } from './reports.data';

export const reportHandlers = [
  http.get('/api/v1/datasets/:datasetId/runs', async () => {
    return HttpResponse.json({
      content: [
        {
          publicId: 'test-run-123',
          projectId: 'project-1',
          datasetId: 'dataset-1',
          targetId: 'target-1',
          status: 'COMPLETED',
          runMode: 'FULL',
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          totalCases: 4,
          failedCases: 2,
          errorCases: 0,
          uncertainCases: 0,
          skippedCases: 0,
          progressPercentage: 100,
          cases: []
        }
      ],
      pageable: { pageNumber: 0, pageSize: 20 },
      totalElements: 1,
      totalPages: 1,
      last: true
    });
  }),

  http.get('/api/v1/runs/:runId/report', async () => {
    await delay(500); // Simulate network latency
    return HttpResponse.json(mockReport);
  }),
  
  http.get('/api/v1/runs/:runId/results', async () => {
    await delay(300);
    return HttpResponse.json(mockReport.results);
  }),

  http.post('/api/v1/runs/:runId/review', async () => {
    await delay(400);
    // Simulate updating the mock data locally (optimistic/mock behavior)
    return HttpResponse.json({
      runPublicId: 'test-run-123',
      reviewedCount: 1,
      reviews: [] 
    });
  })
];

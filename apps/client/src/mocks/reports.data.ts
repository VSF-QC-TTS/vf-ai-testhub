import { v4 as uuidv4 } from 'uuid';
import type { RunReportResponse, TestResultReportItem } from '../features/reports/reports.types';

const mockTestCases: TestResultReportItem[] = [
  {
    publicId: uuidv4(),
    testCasePublicId: uuidv4(),
    testCaseName: 'Test Login Flow with valid credentials',
    testCaseInput: '{"username":"admin", "password":"password"}',
    sectionName: 'Authentication',
    autoStatus: 'PASSED',
    finalStatus: 'PASSED',
    score: 1.0,
    requestSnapshot: { url: 'https://api.example.com/login', method: 'POST' },
    rawResponse: { status: 200, body: { token: 'abc' } },
    responseSnapshot: { token: 'abc' },
    extractedComponents: {},
    extractedToolCalls: null,
    latencyMs: 120,
    errorMessage: null,
    manualReview: null,
    assertionResults: [
      {
        publicId: uuidv4(),
        testResultPublicId: uuidv4(),
        assertionPublicId: uuidv4(),
        status: 'PASSED',
        actualValue: 200,
        expectedValue: 200,
        reason: 'Status Code is 200',
        score: 1.0,
        severity: 'MAJOR',
        metadata: {},
        createdAt: new Date().toISOString()
      }
    ],
    toolExpectationResults: [],
    createdAt: new Date().toISOString()
  },
  {
    publicId: uuidv4(),
    testCasePublicId: uuidv4(),
    testCaseName: 'Test Login with invalid credentials',
    testCaseInput: '{"username":"admin", "password":"wrong"}',
    sectionName: 'Authentication',
    autoStatus: 'FAILED',
    finalStatus: 'FAILED',
    score: 0.0,
    requestSnapshot: { url: 'https://api.example.com/login', method: 'POST' },
    rawResponse: { status: 500, message: 'Internal Server Error' },
    responseSnapshot: { message: 'Internal Server Error' },
    extractedComponents: {},
    extractedToolCalls: null,
    latencyMs: 200,
    errorMessage: 'Expected 401 but got 500',
    manualReview: null,
    assertionResults: [
      {
        publicId: uuidv4(),
        testResultPublicId: uuidv4(),
        assertionPublicId: uuidv4(),
        status: 'FAILED',
        actualValue: 500,
        expectedValue: 401,
        reason: 'Status Code is 401',
        score: 0.0,
        severity: 'CRITICAL',
        metadata: {},
        createdAt: new Date().toISOString()
      }
    ],
    toolExpectationResults: [],
    createdAt: new Date().toISOString()
  }
];

export const mockReport: RunReportResponse = {
  runPublicId: 'test-run-123',
  total: 2,
  passed: 1,
  failed: 1,
  error: 0,
  skipped: 0,
  uncertain: 0,
  passRate: 50.0,
  results: mockTestCases
};

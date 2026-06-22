import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsTable } from './components/ResultsTable';
import type { TestResultReportItem } from './reports.types';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

// Mock Router
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

// Mock Drawer to avoid nested errors
vi.mock('./components/ResultDetailDrawer', () => ({
  ResultDetailDrawer: () => <div data-testid="mock-drawer" />
}));

const mockResults: TestResultReportItem[] = [
  {
    publicId: 'r1',
    testCasePublicId: 'tc1',
    testCaseName: 'Login Success',
    testCaseInput: '{}',
    sectionName: 'Auth',
    autoStatus: 'PASSED',
    finalStatus: 'PASSED',
    score: 1.0,
    requestSnapshot: null,
    rawResponse: null,
    responseSnapshot: null,
    extractedComponents: null,
    extractedToolCalls: null,
    latencyMs: 100,
    errorMessage: null,
    manualReview: null,
    assertionResults: [],
    toolExpectationResults: [],
    createdAt: new Date().toISOString()
  },
  {
    publicId: 'r2',
    testCasePublicId: 'tc2',
    testCaseName: 'Login Failure',
    testCaseInput: '{}',
    sectionName: 'Auth',
    autoStatus: 'FAILED',
    finalStatus: 'FAILED',
    score: 0.0,
    requestSnapshot: null,
    rawResponse: null,
    responseSnapshot: null,
    extractedComponents: null,
    extractedToolCalls: null,
    latencyMs: 120,
    errorMessage: null,
    manualReview: null,
    assertionResults: [
      {
        publicId: 'a1',
        testResultPublicId: 'r2',
        assertionPublicId: 'ax1',
        status: 'FAILED',
        actualValue: 500,
        expectedValue: 200,
        reason: 'Status Code',
        score: 0,
        severity: 'CRITICAL',
        metadata: null,
        createdAt: new Date().toISOString()
      }
    ],
    toolExpectationResults: [],
    createdAt: new Date().toISOString()
  }
];

describe('ResultsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all results initially', () => {
    render(<ResultsTable results={mockResults} runId="run123" />);
    expect(screen.getByText('Login Success')).toBeInTheDocument();
    expect(screen.getByText('Login Failure')).toBeInTheDocument();
  });

  it('calls setSearchParams when search input changes', () => {
    render(<ResultsTable results={mockResults} runId="run123" />);
    const input = screen.getByPlaceholderText(/Search test cases/i);
    fireEvent.change(input, { target: { value: 'Success' } });
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('can toggle row expansion to show assertions', () => {
    render(<ResultsTable results={mockResults} runId="run123" />);
    
    const expandButtons = screen.getAllByRole('button').filter(b => b.className.includes('h-6 w-6'));
    
    // Expand the second row (Login Failure)
    fireEvent.click(expandButtons[1]);
    
    // Assertion diff should now be visible
    expect(screen.getByText('Status Code')).toBeInTheDocument();
  });
});

import { useMutation } from '@tanstack/react-query';
import { apiClient } from "@/lib/api/client";
import type {
  AssertionDraftDto,
  GenerateTestCasesDto,
  SuggestAssertionsDto,
  SuggestionResponseDto,
  TestCaseDraftDto,
  ToolExpectationDraftDto,
} from './ai.schemas';

const BASE_PATH = '/api/v1';

interface GenerateTestCasesResponseDto {
  draftBatchId: string;
  datasetId: string;
  drafts: Array<{
    draftId: string;
    name?: string | null;
    description?: string | null;
    input?: string | null;
    variables?: Record<string, unknown> | null;
    expectedBehavior?: string | null;
    referenceAnswer?: string | null;
    category?: string | null;
    priority?: string | null;
    tags?: string[] | null;
    suggestedAssertions?: unknown[] | null;
    suggestedToolExpectations?: unknown[] | null;
  }>;
}

interface SuggestAssertionsResponseDto {
  testCaseId: string;
  assertions: Array<AssertionDraftDto["assertion"]>;
  toolExpectations: Array<ToolExpectationDraftDto["toolExpectation"]>;
}

export const generateTestCases = async (params: { projectId: string; datasetId: string; body: GenerateTestCasesDto }) => {
  const { data } = await apiClient.post<GenerateTestCasesResponseDto>(
    `${BASE_PATH}/datasets/${params.datasetId}/ai-generate-testcases`,
    {
      ...params.body,
      projectId: params.projectId,
      datasetId: params.datasetId,
    }
  );

  return data.drafts.map((draft): TestCaseDraftDto => ({
    draftId: draft.draftId,
    testCase: {
      name: draft.name ?? undefined,
      description: draft.description ?? undefined,
      input: draft.input ?? undefined,
      variables: draft.variables ?? undefined,
      expectedBehavior: draft.expectedBehavior ?? undefined,
      referenceAnswer: draft.referenceAnswer ?? undefined,
      sectionName: draft.category ?? undefined,
      priority: draft.priority as TestCaseDraftDto["testCase"]["priority"],
      tags: draft.tags ?? undefined,
    },
    provenance: {
      prompt: params.body.businessRequirement,
      model: "ai-provider",
      generatedAt: new Date().toISOString(),
    },
  }));
};

export const suggestAssertions = async (params: { testCaseId: string; body: SuggestAssertionsDto }) => {
  const { data } = await apiClient.post<SuggestAssertionsResponseDto>(
    `${BASE_PATH}/test-cases/${params.testCaseId}/ai-suggest-assertions`,
    {
      ...params.body,
      testCaseId: params.testCaseId,
    }
  );

  return {
    assertions: data.assertions.map((assertion, index) => ({
      draftId: `assertion-${index + 1}`,
      assertion,
    })),
    toolExpectations: data.toolExpectations.map((toolExpectation, index) => ({
      draftId: `tool-${index + 1}`,
      toolExpectation,
    })),
    provenance: {
      prompt: params.body.expectedBehavior,
      model: "ai-provider",
      generatedAt: new Date().toISOString(),
    },
  } satisfies SuggestionResponseDto;
};

// React Query Hooks

export const useGenerateTestCases = () => {
  return useMutation({
    mutationFn: generateTestCases,
  });
};

export const useSuggestAssertions = () => {
  return useMutation({
    mutationFn: suggestAssertions,
  });
};

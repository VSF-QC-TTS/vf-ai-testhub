import type { RunJobEnvelope, RunSnapshot } from "../types/RunSnapshot.js";

export function runJobEnvelopeFixture(): RunJobEnvelope {
  return {
    runId: "run-1",
    correlationId: "corr-1",
    publishedAt: "2026-06-22T00:00:00Z",
    snapshot: runSnapshotFixture(),
  };
}

export function runSnapshotFixture(): RunSnapshot {
  return {
    runId: "run-1",
    runMode: "FULL_DATASET",
    projectId: "project-1",
    datasetId: "dataset-1",
    target: {
      id: "target-1",
      name: "Target",
      targetType: "HTTP",
      method: "POST",
      url: "https://chatbot.test/api",
      queryParamsTemplate: {},
      headersTemplate: {},
      bodyTemplate: { message: "{{input}}" },
      authConfig: {},
      llmProvider: null,
      llmModel: null,
      llmBaseUrl: null,
      llmKeyRef: null,
      inputBinding: {},
      variableBindings: {},
      timeoutMs: 30000,
    },
    responseMapping: {
      answerPath: "$.data.answer",
      toolCallsPath: "$.data.tool_calls",
    },
    testCases: [
      {
        id: "case-1",
        externalId: null,
        sectionName: null,
        name: "Case",
        input: "hello",
        expectedBehavior: "answer includes Eco",
        referenceAnswer: null,
        variables: {},
        tags: [],
        assertions: [
          {
            id: "assertion-1",
            scope: "COMPONENT",
            type: "contains",
            targetComponent: "answer",
            fieldPath: null,
            fieldPaths: [],
            expectedValue: "Eco",
            rubric: null,
            rubricOverride: null,
            threshold: 0.8,
            weight: 1,
            severity: "MAJOR",
          },
        ],
        toolExpectations: [
          {
            id: "tool-1",
            expectationType: "TOOL_MUST_BE_CALLED",
            targetSource: "normalized_tool_calls",
            toolName: "search_product",
            agentName: null,
            argumentAssertions: [],
            sequence: [],
            minCalls: null,
            maxCalls: null,
            rubric: null,
            rubricOverride: null,
            threshold: 0.8,
            required: true,
            severity: "MAJOR",
          },
        ],
      },
    ],
    options: {
      includeLlmJudge: true,
      includeToolExpectations: true,
      maxConcurrency: 3,
      timeoutMs: 30000,
      retryCount: 0,
    },
    createdAt: "2026-06-22T00:00:00Z",
  };
}

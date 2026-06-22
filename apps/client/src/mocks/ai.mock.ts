import { http, HttpResponse, delay } from "msw";
import type { GenerateTestCasesDto } from "../features/ai/ai.schemas";

export const aiHandlers = [
  http.post("*/api/v1/datasets/:datasetId/ai-generate-testcases", async ({ params, request }) => {
    await delay(1500); // Simulate AI generation delay
    
    const body = await request.json() as GenerateTestCasesDto;
    const count = body.count || 3;
    
    const drafts = Array.from({ length: count }).map((_, i) => ({
      draftId: `draft-tc-${Date.now()}-${i}`,
      name: `${body.featureName} - Scenario ${i + 1}`,
      input: `User asks: "Can you help me with ${body.featureName}?"`,
      expectedBehavior: `The chatbot should acknowledge the request based on the requirement: ${body.businessRequirement.substring(0, 50)}...`,
      category: "AI Generated",
      priority: "P2",
      tags: ["ai-generated"],
    }));

    return HttpResponse.json({
      draftBatchId: `draft-batch-${Date.now()}`,
      datasetId: params.datasetId,
      drafts,
    });
  }),

  http.post("*/api/v1/test-cases/:testCaseId/ai-suggest-assertions", async ({ params, request }) => {
    await delay(1500); // Simulate AI generation delay
    
    await request.json();
    
    return HttpResponse.json({
      testCaseId: params.testCaseId,
      assertions: [
        {
          type: "llm_rubric",
          scope: "WHOLE_RESPONSE",
          rubricOverride: "Ensure the answer directly addresses the user's query without hallucination.",
          threshold: 0.9,
        },
        {
          type: "equals",
          scope: "FIELD",
          fieldPath: "intent.name",
          expectedValue: "handle_request",
        }
      ],
      toolExpectations: [],
    });
  }),
];

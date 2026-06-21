package vn.vinfast.aitesthub.ai.prompt;

import java.util.List;
import org.springframework.stereotype.Component;
import vn.vinfast.aitesthub.ai.request.GenerateTestCasesRequest;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Component
public class AiPromptTemplateBuilder {

  public String systemPrompt() {
    return """
        You are an expert QA engineer for chatbot and agent evaluation.
        Return only valid JSON. Do not wrap JSON in Markdown fences.
        Generate draft artifacts for QC review; never claim they are persisted or executed.
        Keep assertions concrete and machine-checkable. Use llm_rubric only when rule-based checks are insufficient.
        """;
  }

  public String buildTestCaseGenerationPrompt(GenerateTestCasesRequest request) {
    int count = request.count() == null ? 10 : request.count();
    String language = request.language() == null || request.language().isBlank() ? "vi" : request.language();
    return """
        Generate %d testcase drafts for the feature below.

        Feature: %s
        Language: %s
        Business requirement:
        %s

        Project context:
        %s

        Dataset context:
        %s

        Policy context:
        %s

        Mock data:
        %s

        DB context:
        %s

        Desired categories: %s
        Available response components: %s
        Available tools: %s
        Default rubric IDs: %s
        Existing testcase IDs to avoid duplicating: %s

        Output JSON schema:
        {
          "drafts": [
            {
              "draftId": "short stable client-side id",
              "name": "short test name",
              "description": "why this case matters",
              "input": "user message to test",
              "variables": {},
              "expectedBehavior": "observable behavior the bot must satisfy",
              "referenceAnswer": "optional ideal answer",
              "category": "happy_path|negative|edge_case|typo|no_accent|ambiguous|out_of_scope|prompt_injection|policy_boundary|safety|tool_call|suggestion|retrieval",
              "priority": "P0|P1|P2|P3",
              "tags": ["lowercase_tag"],
              "suggestedAssertions": [
                {
                  "scope": "WHOLE_RESPONSE|COMPONENT|FIELD|MULTI_FIELD",
                  "type": "contains|not_contains|equals|not_equals|regex|greater_than|less_than|between|is_true|is_false|field_exists|field_not_exists|array_length_greater_than|array_contains|llm_rubric",
                  "targetComponent": "answer",
                  "fieldPath": "$.answer",
                  "fieldPaths": [],
                  "expectedValue": "expected value when relevant",
                  "rubricId": null,
                  "rubricOverride": null,
                  "threshold": 0.8,
                  "weight": 1.0,
                  "severity": "CRITICAL|MAJOR|MINOR|INFO"
                }
              ],
              "suggestedToolExpectations": [
                {
                  "expectationType": "TOOL_MUST_BE_CALLED|TOOL_MUST_NOT_BE_CALLED|TOOL_ARGS_MATCH|TOOL_SEQUENCE_MATCH|TOOL_CALL_COUNT|TOOL_OUTPUT_USED_IN_ANSWER|AGENT_EQUALS|AGENT_NOT_EQUALS|AGENT_STEP_CONTAINS",
                  "targetSource": "normalized_tool_calls",
                  "toolName": "tool name when relevant",
                  "agentName": null,
                  "argumentAssertions": [],
                  "sequence": [],
                  "minCalls": null,
                  "maxCalls": null,
                  "rubricId": null,
                  "rubricOverride": null,
                  "threshold": 0.8,
                  "required": true,
                  "severity": "CRITICAL|MAJOR|MINOR|INFO"
                }
              ]
            }
          ]
        }

        Rules:
        - Return exactly one JSON object matching the schema.
        - Generate at most %d drafts.
        - Include tool expectations only when available tools or trace components make them testable.
        - Prefer the available response components when targeting component assertions.
        - Do not invent policy facts outside the provided requirement/context.
        """
        .formatted(
            count,
            request.featureName(),
            language,
            request.businessRequirement(),
            text(request.projectContext()),
            text(request.datasetContext()),
            text(request.policyContext()),
            text(request.mockData()),
            text(request.dbContext()),
            list(request.categories()),
            list(request.availableComponents()),
            list(request.availableTools()),
            list(request.defaultRubrics()),
            list(request.existingTestcases()),
            count);
  }

  private String text(String value) {
    return value == null || value.isBlank() ? "(none)" : value;
  }

  private String list(List<?> value) {
    return value == null || value.isEmpty() ? "[]" : value.toString();
  }
}

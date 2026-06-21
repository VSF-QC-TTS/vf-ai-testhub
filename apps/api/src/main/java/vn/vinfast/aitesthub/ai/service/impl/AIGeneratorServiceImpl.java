package vn.vinfast.aitesthub.ai.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.vinfast.aitesthub.ai.client.AiChatClient;
import vn.vinfast.aitesthub.ai.draft.AssertionDraft;
import vn.vinfast.aitesthub.ai.draft.TestCaseDraft;
import vn.vinfast.aitesthub.ai.draft.ToolExpectationDraft;
import vn.vinfast.aitesthub.ai.prompt.AiPromptTemplateBuilder;
import vn.vinfast.aitesthub.ai.request.GenerateTestCasesRequest;
import vn.vinfast.aitesthub.ai.response.GeneratedTestCaseDrafts;
import vn.vinfast.aitesthub.ai.response.TestCaseDraftBatchResponse;
import vn.vinfast.aitesthub.ai.service.AIGeneratorService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AIGeneratorServiceImpl implements AIGeneratorService {

  private static final int MAX_ATTEMPTS = 2;

  private final AiChatClient aiChatClient;
  private final AiPromptTemplateBuilder promptTemplateBuilder;
  private final ObjectMapper objectMapper;

  @Override
  public TestCaseDraftBatchResponse generateTestCases(GenerateTestCasesRequest request) {
    String systemPrompt = promptTemplateBuilder.systemPrompt();
    String userPrompt = promptTemplateBuilder.buildTestCaseGenerationPrompt(request);
    for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        String rawResponse = aiChatClient.complete(systemPrompt, userPrompt);
        GeneratedTestCaseDrafts parsed =
            objectMapper.readValue(stripJsonFences(rawResponse), GeneratedTestCaseDrafts.class);
        List<TestCaseDraft> drafts = normalizeAndValidateDrafts(parsed, request);
        return TestCaseDraftBatchResponse.builder()
            .draftBatchId(UUID.randomUUID())
            .datasetId(request.datasetId())
            .drafts(drafts)
            .build();
      } catch (JsonProcessingException | IllegalArgumentException ex) {
        userPrompt = userPrompt + "\n\nPrevious response was invalid JSON/schema. Return corrected JSON only.";
      } catch (RuntimeException ex) {
        throw new ResourceException(
            "AI provider request failed",
            ErrorCode.INTERNAL_SERVER_ERROR.getStatus(),
            "AI_PROVIDER_REQUEST_FAILED");
      }
    }
    throw new ResourceException(
        "AI could not generate valid testcase drafts",
        422,
        "AI_GENERATION_MALFORMED_RESPONSE");
  }

  private List<TestCaseDraft> normalizeAndValidateDrafts(
      GeneratedTestCaseDrafts parsed, GenerateTestCasesRequest request) {
    if (parsed == null || parsed.drafts() == null || parsed.drafts().isEmpty()) {
      throw new IllegalArgumentException("AI response must include at least one draft.");
    }
    int maxCount = request.count() == null ? 10 : request.count();
    if (parsed.drafts().size() > maxCount) {
      throw new IllegalArgumentException("AI response contains more drafts than requested.");
    }
    return parsed.drafts().stream().map(this::normalizeAndValidateDraft).toList();
  }

  private TestCaseDraft normalizeAndValidateDraft(TestCaseDraft draft) {
    if (draft == null || !StringUtils.hasText(draft.input())) {
      throw new IllegalArgumentException("Each draft must include input.");
    }
    if (!StringUtils.hasText(draft.expectedBehavior())) {
      throw new IllegalArgumentException("Each draft must include expectedBehavior.");
    }
    List<AssertionDraft> assertions =
        draft.suggestedAssertions() == null ? List.of() : draft.suggestedAssertions();
    assertions.forEach(this::validateAssertionDraft);
    List<ToolExpectationDraft> tools =
        draft.suggestedToolExpectations() == null ? List.of() : draft.suggestedToolExpectations();
    tools.forEach(this::validateToolExpectationDraft);
    return TestCaseDraft.builder()
        .draftId(StringUtils.hasText(draft.draftId()) ? draft.draftId() : UUID.randomUUID().toString())
        .name(StringUtils.hasText(draft.name()) ? draft.name() : draft.input())
        .description(draft.description())
        .input(draft.input())
        .variables(draft.variables() == null ? Map.of() : draft.variables())
        .expectedBehavior(draft.expectedBehavior())
        .referenceAnswer(draft.referenceAnswer())
        .category(draft.category())
        .priority(draft.priority() == null ? TestPriority.P2 : draft.priority())
        .tags(draft.tags() == null ? List.of() : draft.tags())
        .suggestedAssertions(assertions)
        .suggestedToolExpectations(tools)
        .build();
  }

  private void validateAssertionDraft(AssertionDraft draft) {
    if (draft.scope() == null || draft.type() == null) {
      throw new IllegalArgumentException("Assertion drafts must include scope and type.");
    }
  }

  private void validateToolExpectationDraft(ToolExpectationDraft draft) {
    if (draft.expectationType() == null) {
      throw new IllegalArgumentException("Tool expectation drafts must include expectationType.");
    }
  }

  private String stripJsonFences(String rawResponse) {
    if (!StringUtils.hasText(rawResponse)) {
      throw new IllegalArgumentException("AI response is empty.");
    }
    String text = rawResponse.trim();
    if (text.startsWith("```")) {
      int firstNewline = text.indexOf('\n');
      int lastFence = text.lastIndexOf("```");
      if (firstNewline >= 0 && lastFence > firstNewline) {
        text = text.substring(firstNewline + 1, lastFence).trim();
      }
    }
    return text;
  }
}

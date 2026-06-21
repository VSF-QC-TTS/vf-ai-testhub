package vn.vinfast.aitesthub.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Queue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vinfast.aitesthub.ai.client.AiChatClient;
import vn.vinfast.aitesthub.ai.prompt.AiPromptTemplateBuilder;
import vn.vinfast.aitesthub.ai.request.GenerateTestCasesRequest;
import vn.vinfast.aitesthub.ai.request.SuggestAssertionsRequest;
import vn.vinfast.aitesthub.ai.service.impl.AIGeneratorServiceImpl;
import vn.vinfast.aitesthub.exception.ResourceException;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
class AIGeneratorServiceImplTest {

  private FakeAiChatClient aiChatClient;
  private AIGeneratorServiceImpl aiGeneratorService;

  @BeforeEach
  void setUp() {
    aiChatClient = new FakeAiChatClient();
    aiGeneratorService =
        new AIGeneratorServiceImpl(
            aiChatClient, new AiPromptTemplateBuilder(), new ObjectMapper());
  }

  @Test
  void generateTestCases_validJson_parsesDrafts() {
    aiChatClient.enqueue(testCaseDraftJson());

    var response = aiGeneratorService.generateTestCases(generateRequest());

    assertThat(response.draftBatchId()).isNotNull();
    assertThat(response.drafts()).hasSize(1);
    assertThat(response.drafts().getFirst().input()).isEqualTo("VinFast VF 8 co may phien ban?");
    assertThat(response.drafts().getFirst().priority().name()).isEqualTo("P1");
    assertThat(response.drafts().getFirst().suggestedAssertions()).hasSize(1);
  }

  @Test
  void generateTestCases_malformedFirstResponse_retriesAndReturnsValidDrafts() {
    aiChatClient.enqueue("{not-json");
    aiChatClient.enqueue(testCaseDraftJson());

    var response = aiGeneratorService.generateTestCases(generateRequest());

    assertThat(aiChatClient.calls).isEqualTo(2);
    assertThat(response.drafts()).hasSize(1);
  }

  @Test
  void generateTestCases_malformedResponses_throwsMappedFailure() {
    aiChatClient.enqueue("{not-json");
    aiChatClient.enqueue("{still-not-json");

    assertThatThrownBy(() -> aiGeneratorService.generateTestCases(generateRequest()))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "AI_GENERATION_MALFORMED_RESPONSE");
    assertThat(aiChatClient.calls).isEqualTo(2);
  }

  @Test
  void generateTestCases_providerError_throwsMappedFailure() {
    aiChatClient.exception = new RuntimeException("timeout");

    assertThatThrownBy(() -> aiGeneratorService.generateTestCases(generateRequest()))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "AI_PROVIDER_REQUEST_FAILED");
  }

  @Test
  void suggestAssertions_withoutToolContext_stripsToolExpectations() {
    aiChatClient.enqueue(assertionSuggestionJson());

    var response =
        aiGeneratorService.suggestAssertions(
            new SuggestAssertionsRequest(
                null,
                "Question",
                "Answer must mention Eco and Plus",
                null,
                null,
                "vi",
                List.of("answer"),
                List.of()));

    assertThat(response.assertions()).hasSize(1);
    assertThat(response.toolExpectations()).isEmpty();
  }

  private GenerateTestCasesRequest generateRequest() {
    return new GenerateTestCasesRequest(
        null,
        null,
        null,
        null,
        "VF 8 product info",
        "Bot must answer VF 8 version questions from policy data",
        null,
        null,
        null,
        "vi",
        1,
        List.of("happy_path"),
        List.of("answer"),
        List.of("search_product"),
        List.of(),
        List.of());
  }

  private String testCaseDraftJson() {
    return """
        {
          "drafts": [
            {
              "draftId": "draft-1",
              "name": "VF 8 versions",
              "description": "Happy path",
              "input": "VinFast VF 8 co may phien ban?",
              "variables": {},
              "expectedBehavior": "Bot mentions Eco and Plus.",
              "referenceAnswer": "VF 8 co hai phien ban Eco va Plus.",
              "category": "happy_path",
              "priority": "P1",
              "tags": ["vf8"],
              "suggestedAssertions": [
                {
                  "scope": "WHOLE_RESPONSE",
                  "type": "contains",
                  "expectedValue": "Eco",
                  "threshold": 0.8,
                  "weight": 1.0,
                  "severity": "MAJOR"
                }
              ],
              "suggestedToolExpectations": []
            }
          ]
        }
        """;
  }

  private String assertionSuggestionJson() {
    return """
        {
          "assertions": [
            {
              "scope": "WHOLE_RESPONSE",
              "type": "contains",
              "expectedValue": "Eco",
              "threshold": 0.8,
              "weight": 1.0,
              "severity": "MAJOR"
            }
          ],
          "toolExpectations": [
            {
              "expectationType": "TOOL_MUST_BE_CALLED",
              "targetSource": "normalized_tool_calls",
              "toolName": "search_product",
              "required": true,
              "severity": "MAJOR"
            }
          ]
        }
        """;
  }

  static class FakeAiChatClient implements AiChatClient {
    final Queue<String> responses = new ArrayDeque<>();
    RuntimeException exception;
    int calls;

    void enqueue(String response) {
      responses.add(response);
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
      calls++;
      if (exception != null) {
        throw exception;
      }
      return responses.remove();
    }
  }
}

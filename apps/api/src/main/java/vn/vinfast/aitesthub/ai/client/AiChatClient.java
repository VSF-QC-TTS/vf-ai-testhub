package vn.vinfast.aitesthub.ai.client;

/**
 * Thin abstraction over the configured LLM chat provider.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public interface AiChatClient {

  /**
   * Sends a system/user prompt pair to the configured model and returns raw model text.
   *
   * @param systemPrompt stable system instructions for the model
   * @param userPrompt task-specific user prompt
   * @return raw model response text
   */
  String complete(String systemPrompt, String userPrompt);
}

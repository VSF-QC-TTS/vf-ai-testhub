package vn.vinfast.aitesthub.ai.client.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import vn.vinfast.aitesthub.ai.client.AiChatClient;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Component
@RequiredArgsConstructor
public class GeminiAiChatClient implements AiChatClient {

  private final ChatClient.Builder chatClientBuilder;

  @Override
  public String complete(String systemPrompt, String userPrompt) {
    return chatClientBuilder
        .build()
        .prompt()
        .system(systemPrompt)
        .user(userPrompt)
        .call()
        .content();
  }
}

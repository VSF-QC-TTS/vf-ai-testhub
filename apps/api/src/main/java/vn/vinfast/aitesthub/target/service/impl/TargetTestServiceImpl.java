package vn.vinfast.aitesthub.target.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetTestResponse;
import vn.vinfast.aitesthub.target.service.TargetTestService;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TargetTestServiceImpl implements TargetTestService {

  private final ObjectMapper objectMapper;

  @Override
  public TargetTestResponse testConnection(TargetRequest request) {
    if (request.targetType() == TargetType.LLM) {
      return new TargetTestResponse(
          0,
          0,
          null,
          "Testing connection for Native LLM targets is currently not supported via this endpoint."
      );
    }

    if (request.url() == null || request.url().isBlank()) {
      return new TargetTestResponse(0, 0, null, "URL is required for HTTP targets.");
    }

    int timeout = request.timeoutMs() != null && request.timeoutMs() > 0 ? request.timeoutMs() : 30000;
    
    HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofMillis(timeout))
        .build();

    HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
        .uri(URI.create(request.url()))
        .timeout(Duration.ofMillis(timeout));

    boolean hasContentType = false;
    if (request.headersTemplate() != null) {
      for (Map.Entry<String, Object> entry : request.headersTemplate().entrySet()) {
        requestBuilder.header(entry.getKey(), String.valueOf(entry.getValue()));
        if (entry.getKey().equalsIgnoreCase("Content-Type")) {
          hasContentType = true;
        }
      }
    }
    
    if (request.bodyTemplate() != null && !request.bodyTemplate().isEmpty() && !hasContentType) {
      requestBuilder.header("Content-Type", "application/json");
    }

    String bodyStr = "";
    if (request.bodyTemplate() != null && !request.bodyTemplate().isEmpty()) {
      try {
        bodyStr = objectMapper.writeValueAsString(request.bodyTemplate());
      } catch (JsonProcessingException e) {
        log.warn("Failed to serialize body template", e);
        return new TargetTestResponse(0, 0, null, "Invalid body template JSON structure");
      }
    }

    String method = request.method() != null ? request.method().name() : "GET";
    requestBuilder.method(method, bodyStr.isEmpty() ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(bodyStr));

    Instant start = Instant.now();
    try {
      HttpResponse<String> response = client.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
      long duration = Duration.between(start, Instant.now()).toMillis();
      return new TargetTestResponse(
          response.statusCode(),
          duration,
          response.body(),
          null
      );
    } catch (Exception e) {
      long duration = Duration.between(start, Instant.now()).toMillis();
      return new TargetTestResponse(
          0,
          duration,
          null,
          "Unexpected error: " + e.getMessage()
      );
    }
  }
}

package vn.vinfast.aitesthub.target.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.service.impl.CurlParserServiceImpl;

class CurlParserServiceTest {

  private CurlParserServiceImpl curlParserService;

  @BeforeEach
  void setUp() {
    ObjectMapper objectMapper = new ObjectMapper();
    TargetSecretDetector secretDetector = new TargetSecretDetector();
    curlParserService = new CurlParserServiceImpl(objectMapper, secretDetector);
  }

  @Test
  void parseCurl_postWithJsonBody_shouldParseCorrectly() {
    String curl = "curl -X POST 'https://api.example.com/v1/chat' "
        + "-H 'Content-Type: application/json' "
        + "-H 'Authorization: Bearer token' "
        + "-d '{\"message\": \"hello\", \"model\": \"gpt-4\"}'";

    CurlParserService.ParsedCurl result = curlParserService.parseCurl(curl);

    assertThat(result.method).isEqualTo(HttpMethod.POST);
    assertThat(result.url).isEqualTo("https://api.example.com/v1/chat");

    assertThat(result.headersTemplate).isNotNull();
    assertThat(result.headersTemplate.get("Content-Type")).isEqualTo("application/json");
    assertThat(result.headersTemplate.get("Authorization")).isEqualTo("Bearer {{secret:AUTH_TOKEN}}");

    assertThat(result.bodyTemplate).isNotNull();
    assertThat(result.bodyTemplate.get("message")).isEqualTo("hello");
    assertThat(result.bodyTemplate.get("model")).isEqualTo("gpt-4");
  }

  @Test
  void parseCurl_getWithQueryParams_shouldParseCorrectly() {
    String curl = "curl 'https://api.example.com/v1/users?page=1&size=10' "
        + "-H 'Accept: application/json'";

    CurlParserService.ParsedCurl result = curlParserService.parseCurl(curl);

    assertThat(result.method).isEqualTo(HttpMethod.GET);
    assertThat(result.url).isEqualTo("https://api.example.com/v1/users");

    assertThat(result.queryParamsTemplate).isNotNull();
    assertThat(result.queryParamsTemplate.get("page")).isEqualTo("1");
    assertThat(result.queryParamsTemplate.get("size")).isEqualTo("10");

    assertThat(result.headersTemplate).isNotNull();
    assertThat(result.headersTemplate.get("Accept")).isEqualTo("application/json");

    assertThat(result.bodyTemplate).isNull();
  }

  @Test
  void parseCurl_invalidFormat_shouldThrowResourceException() {
    String curl = "wget https://api.example.com";

    assertThatThrownBy(() -> curlParserService.parseCurl(curl))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.CURL_PARSE_ERROR.getMessage());
  }

  @Test
  void parseCurl_emptyCommand_shouldThrowResourceException() {
    assertThatThrownBy(() -> curlParserService.parseCurl("   "))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.CURL_PARSE_ERROR.getMessage());
  }
}

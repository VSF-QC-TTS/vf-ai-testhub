package vn.vinfast.aitesthub.target.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;
import vn.vinfast.aitesthub.target.service.CurlParserService;
import vn.vinfast.aitesthub.target.service.TargetService;

@WebMvcTest(
    controllers = TargetController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, TargetControllerTest.MockBeans.class})
class TargetControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void resetMock() {
    MockTargetService.reset();
    MockCurlParserService.reset();
  }

  @Test
  void parseCurl_validRequest_shouldReturn200() throws Exception {
    UUID projectId = UUID.randomUUID();

    String curlCmd = "curl -X POST 'https://api.example.com/v1/chat'";
    Map<String, String> request = Map.of(
        "name", "Test API",
        "environment", "dev",
        "curlCommand", curlCmd
    );

    CurlParserService.ParsedCurl parsed = new CurlParserService.ParsedCurl();
    parsed.method = HttpMethod.POST;
    parsed.url = "https://api.example.com/v1/chat";

    MockCurlParserService.parseCurlResponse = parsed;

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/targets/parse-curl", projectId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Test API"))
        .andExpect(jsonPath("$.url").value("https://api.example.com/v1/chat"));

    assertThat(MockCurlParserService.capturedCurlCommand).isEqualTo(curlCmd);
  }

  @Test
  void createTarget_validRequest_shouldReturn201() throws Exception {
    UUID projectId = UUID.randomUUID();
    UUID targetId = UUID.randomUUID();

    TargetRequest request = new TargetRequest(
        projectId, "Test Target", "dev", TargetType.HTTP, vn.vinfast.aitesthub.target.enums.HttpMethod.POST, "http://test.local", null, null, null, null, null, null, null, null, null, null, 30000, false, null
    );

    TargetResponse response = new TargetResponse(
        targetId, projectId, "Test Target", "dev", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null, OffsetDateTime.now(), OffsetDateTime.now()
    );

    MockTargetService.createTargetResponse = response;

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/targets", projectId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.publicId").value(targetId.toString()))
        .andExpect(jsonPath("$.name").value("Test Target"));

    assertThat(MockTargetService.capturedCreateRequest.projectId()).isEqualTo(projectId);
    assertThat(MockTargetService.capturedCreateRequest.name()).isEqualTo("Test Target");
  }

  @Test
  void getTargets_shouldReturn200() throws Exception {
    UUID projectId = UUID.randomUUID();
    UUID targetId = UUID.randomUUID();

    TargetResponse response = new TargetResponse(
        targetId, projectId, "Test Target", "dev", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null, OffsetDateTime.now(), OffsetDateTime.now()
    );

    MockTargetService.getTargetsResponse = new PageImpl<>(List.of(response));

    mockMvc
        .perform(
            get("/api/v1/projects/{projectId}/targets", projectId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].publicId").value(targetId.toString()))
        .andExpect(jsonPath("$.content[0].name").value("Test Target"));
  }

  @TestConfiguration
  static class MockBeans {
    @Bean
    TargetService targetService() {
      return new MockTargetService();
    }

    @Bean
    CurlParserService curlParserService() {
      return new MockCurlParserService();
    }

    @Bean
    vn.vinfast.aitesthub.target.service.TargetTestService targetTestService() {
      return request -> new vn.vinfast.aitesthub.target.response.TargetTestResponse(200, 10, "{\"mock\":\"yes\"}", null);
    }
  }

  static class MockTargetService implements TargetService {
    static TargetResponse createTargetResponse;
    static TargetRequest capturedCreateRequest;
    static Page<TargetResponse> getTargetsResponse;
    static boolean throwOnCreate;

    @Override
    public TargetResponse createTarget(TargetRequest request) {
      MockTargetService.capturedCreateRequest = request;
      if (throwOnCreate) {
        throw new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND);
      }
      return createTargetResponse;
    }

    @Override
    public Page<TargetResponse> getTargets(UUID projectId, Pageable pageable) {
      return getTargetsResponse;
    }

    @Override
    public TargetResponse getTarget(UUID targetId) {
      return null;
    }

    @Override
    public TargetResponse updateTarget(UUID targetId, TargetRequest request) {
      return null;
    }

    @Override
    public void deleteTarget(UUID targetId) {
    }

    static void reset() {
      createTargetResponse = null;
      capturedCreateRequest = null;
      getTargetsResponse = null;
      throwOnCreate = false;
    }
  }

  static class MockCurlParserService implements CurlParserService {
    static CurlParserService.ParsedCurl parseCurlResponse;
    static String capturedCurlCommand;
    static boolean throwOnParse;

    @Override
    public CurlParserService.ParsedCurl parseCurl(String curlCommand) {
      MockCurlParserService.capturedCurlCommand = curlCommand;
      if (throwOnParse) {
        throw new ResourceException(ErrorCode.CURL_PARSE_ERROR);
      }
      return parseCurlResponse;
    }

    static void reset() {
      parseCurlResponse = null;
      capturedCurlCommand = null;
      throwOnParse = false;
    }
  }
}

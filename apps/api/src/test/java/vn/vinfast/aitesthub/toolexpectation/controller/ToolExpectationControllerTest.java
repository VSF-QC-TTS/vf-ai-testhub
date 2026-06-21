package vn.vinfast.aitesthub.toolexpectation.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
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
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;
import vn.vinfast.aitesthub.toolexpectation.request.CreateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.request.UpdateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.response.ToolExpectationResponse;
import vn.vinfast.aitesthub.toolexpectation.service.ToolExpectationService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@WebMvcTest(
    controllers = ToolExpectationController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, ToolExpectationControllerTest.Config.class})
class ToolExpectationControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    ToolExpectationService toolExpectationService() {
      return new MockToolExpectationService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID testCaseId = UUID.randomUUID();
  private final UUID expectationId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockToolExpectationService.reset();
    SecurityContextHolder.clearContext();
  }

  @Test
  void createToolExpectation_validRequest_returns201() throws Exception {
    MockToolExpectationService.expectedExpectationId = expectationId;
    CreateToolExpectationRequest request =
        new CreateToolExpectationRequest(
            ToolExpectationType.TOOL_MUST_BE_CALLED,
            null,
            "search_product",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            SeverityLevel.MAJOR,
            null,
            null);

    mockMvc
        .perform(
            post("/api/v1/test-cases/{testCaseId}/tool-expectations", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.publicId").value(expectationId.toString()))
        .andExpect(jsonPath("$.toolName").value("search_product"));
  }

  @Test
  void createToolExpectation_missingType_returns400() throws Exception {
    String request = "{\"toolName\":\"search_product\"}";

    mockMvc
        .perform(
            post("/api/v1/test-cases/{testCaseId}/tool-expectations", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(request)
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
  }

  @Test
  void createToolExpectation_invalidEnum_returns400() throws Exception {
    String request = "{\"expectationType\":\"TOOL_DOES_NOT_EXIST\",\"toolName\":\"search_product\"}";

    mockMvc
        .perform(
            post("/api/v1/test-cases/{testCaseId}/tool-expectations", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(request)
                .with(currentJwt()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void listUpdateDeleteAndNotFound_workThroughService() throws Exception {
    MockToolExpectationService.expectedExpectationId = expectationId;

    mockMvc
        .perform(get("/api/v1/test-cases/{testCaseId}/tool-expectations", testCaseId).with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].publicId").value(expectationId.toString()));

    UpdateToolExpectationRequest update =
        new UpdateToolExpectationRequest(
            null, null, "get_order_status", null, null, null, null, null, null, null, null, null, null, null, null);
    mockMvc
        .perform(
            put("/api/v1/tool-expectations/{expectationId}", expectationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update))
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.toolName").value("get_order_status"));

    mockMvc
        .perform(delete("/api/v1/tool-expectations/{expectationId}", expectationId).with(currentJwt()))
        .andExpect(status().isNoContent());
    assertThat(MockToolExpectationService.deleted).isTrue();

    MockToolExpectationService.throwNotFound = true;
    mockMvc
        .perform(get("/api/v1/tool-expectations/{expectationId}", expectationId).with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("TOOL_EXPECTATION_NOT_FOUND"));
  }

  private RequestPostProcessor currentJwt() {
    return request -> {
      Jwt jwt =
          Jwt.withTokenValue("mock-token")
              .header("alg", "none")
              .claim("sub", currentUsername)
              .subject(currentUsername)
              .build();
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(new TestingAuthenticationToken(jwt, null));
      SecurityContextHolder.setContext(securityContext);
      return request;
    };
  }

  static class MockToolExpectationService implements ToolExpectationService {
    static UUID expectedExpectationId = UUID.randomUUID();
    static boolean throwNotFound = false;
    static boolean deleted = false;

    static void reset() {
      expectedExpectationId = UUID.randomUUID();
      throwNotFound = false;
      deleted = false;
    }

    private ToolExpectationResponse response(String toolName) {
      return ToolExpectationResponse.builder()
          .publicId(expectedExpectationId)
          .testCasePublicId(UUID.randomUUID())
          .expectationType(ToolExpectationType.TOOL_MUST_BE_CALLED)
          .targetSource(TargetSourceType.normalized_tool_calls)
          .toolName(toolName)
          .threshold(BigDecimal.valueOf(0.8))
          .required(true)
          .severity(SeverityLevel.MAJOR)
          .enabled(true)
          .build();
    }

    @Override
    public ToolExpectationResponse createToolExpectation(
        UUID testCasePublicId, CreateToolExpectationRequest request, String username) {
      return response(request.toolName());
    }

    @Override
    public Page<ToolExpectationResponse> getToolExpectations(UUID testCasePublicId, Pageable pageable) {
      return new PageImpl<>(List.of(response("search_product")), pageable, 1);
    }

    @Override
    public ToolExpectationResponse getToolExpectation(UUID publicId) {
      if (throwNotFound) {
        throw new ResourceException(ErrorCode.TOOL_EXPECTATION_NOT_FOUND);
      }
      return response("search_product");
    }

    @Override
    public ToolExpectationResponse updateToolExpectation(
        UUID publicId, UpdateToolExpectationRequest request, String username) {
      return response(request.toolName());
    }

    @Override
    public void deleteToolExpectation(UUID publicId, String username) {
      deleted = true;
    }
  }
}

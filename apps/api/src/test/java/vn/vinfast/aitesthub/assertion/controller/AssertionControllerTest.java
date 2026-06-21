package vn.vinfast.aitesthub.assertion.controller;

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
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.assertion.request.CreateAssertionRequest;
import vn.vinfast.aitesthub.assertion.request.UpdateAssertionRequest;
import vn.vinfast.aitesthub.assertion.response.AssertionResponse;
import vn.vinfast.aitesthub.assertion.service.AssertionService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@WebMvcTest(
    controllers = AssertionController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, AssertionControllerTest.Config.class})
class AssertionControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    AssertionService assertionService() {
      return new MockAssertionService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID testCaseId = UUID.randomUUID();
  private final UUID assertionId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockAssertionService.reset();
    SecurityContextHolder.clearContext();
  }

  @Test
  void createAssertion_validRequest_returns201() throws Exception {
    MockAssertionService.expectedAssertionId = assertionId;
    CreateAssertionRequest request =
        new CreateAssertionRequest(
            AssertionScope.FIELD,
            AssertionType.contains,
            null,
            "$.answer",
            null,
            "VF 8",
            null,
            null,
            null,
            null,
            SeverityLevel.CRITICAL,
            null,
            null);

    mockMvc
        .perform(
            post("/api/v1/test-cases/{testCaseId}/assertions", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.publicId").value(assertionId.toString()))
        .andExpect(jsonPath("$.type").value("contains"));
  }

  @Test
  void createAssertion_missingScope_returns400() throws Exception {
    String request = "{\"type\":\"contains\",\"fieldPath\":\"$.answer\",\"expectedValue\":\"VF 8\"}";

    mockMvc
        .perform(
            post("/api/v1/test-cases/{testCaseId}/assertions", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(request)
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
  }

  @Test
  void createAssertion_invalidEnum_returns400() throws Exception {
    String request = "{\"scope\":\"FIELD\",\"type\":\"unsupported\",\"fieldPath\":\"$.answer\"}";

    mockMvc
        .perform(
            post("/api/v1/test-cases/{testCaseId}/assertions", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(request)
                .with(currentJwt()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void listUpdateDeleteAndNotFound_workThroughService() throws Exception {
    MockAssertionService.expectedAssertionId = assertionId;

    mockMvc
        .perform(get("/api/v1/test-cases/{testCaseId}/assertions", testCaseId).with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].publicId").value(assertionId.toString()));

    UpdateAssertionRequest update =
        new UpdateAssertionRequest(null, null, null, null, null, "VF 9", null, null, null, null, null, null, null);
    mockMvc
        .perform(
            put("/api/v1/assertions/{assertionId}", assertionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update))
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.expectedValue").value("VF 9"));

    mockMvc
        .perform(delete("/api/v1/assertions/{assertionId}", assertionId).with(currentJwt()))
        .andExpect(status().isNoContent());
    assertThat(MockAssertionService.deleted).isTrue();

    MockAssertionService.throwNotFound = true;
    mockMvc
        .perform(get("/api/v1/assertions/{assertionId}", assertionId).with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("ASSERTION_NOT_FOUND"));
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

  static class MockAssertionService implements AssertionService {
    static UUID expectedAssertionId = UUID.randomUUID();
    static boolean throwNotFound = false;
    static boolean deleted = false;

    static void reset() {
      expectedAssertionId = UUID.randomUUID();
      throwNotFound = false;
      deleted = false;
    }

    private AssertionResponse response(Object expectedValue) {
      return AssertionResponse.builder()
          .publicId(expectedAssertionId)
          .testCasePublicId(UUID.randomUUID())
          .scope(AssertionScope.FIELD)
          .type(AssertionType.contains)
          .fieldPath("$.answer")
          .expectedValue(expectedValue)
          .threshold(BigDecimal.valueOf(0.8))
          .weight(BigDecimal.ONE)
          .severity(SeverityLevel.MAJOR)
          .enabled(true)
          .build();
    }

    @Override
    public AssertionResponse createAssertion(UUID testCasePublicId, CreateAssertionRequest request, String username) {
      return response(request.expectedValue());
    }

    @Override
    public Page<AssertionResponse> getAssertions(UUID testCasePublicId, Pageable pageable) {
      return new PageImpl<>(List.of(response("VF 8")), pageable, 1);
    }

    @Override
    public AssertionResponse getAssertion(UUID publicId) {
      if (throwNotFound) {
        throw new ResourceException(ErrorCode.ASSERTION_NOT_FOUND);
      }
      return response("VF 8");
    }

    @Override
    public AssertionResponse updateAssertion(UUID publicId, UpdateAssertionRequest request, String username) {
      return response(request.expectedValue());
    }

    @Override
    public void deleteAssertion(UUID publicId, String username) {
      deleted = true;
    }
  }
}

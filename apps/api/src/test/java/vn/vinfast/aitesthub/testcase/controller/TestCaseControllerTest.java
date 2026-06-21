package vn.vinfast.aitesthub.testcase.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;
import vn.vinfast.aitesthub.testcase.request.CreateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.request.TestCaseFilter;
import vn.vinfast.aitesthub.testcase.request.UpdateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.response.TestCaseResponse;
import vn.vinfast.aitesthub.testcase.service.TestCaseService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@WebMvcTest(
    controllers = TestCaseController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, TestCaseControllerTest.Config.class})
class TestCaseControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    TestCaseService testCaseService() {
      return new MockTestCaseService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID datasetId = UUID.randomUUID();
  private final UUID testCaseId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockTestCaseService.reset();
    SecurityContextHolder.clearContext();
  }

  @Test
  void createTestCase_validRequest_returns201() throws Exception {
    CreateTestCaseRequest request =
        new CreateTestCaseRequest(null, "Auth", "Login", null, "How do I log in?", null, null, null, null, null, null, null, null);
    MockTestCaseService.expectedTestCaseId = testCaseId;

    mockMvc
        .perform(
            post("/api/v1/datasets/{datasetId}/test-cases", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.publicId").value(testCaseId.toString()))
        .andExpect(jsonPath("$.input").value("How do I log in?"));
  }

  @Test
  void createTestCase_missingInput_returns400() throws Exception {
    CreateTestCaseRequest request =
        new CreateTestCaseRequest(null, null, null, null, "", null, null, null, null, null, null, null, null);

    mockMvc
        .perform(
            post("/api/v1/datasets/{datasetId}/test-cases", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        .andExpect(jsonPath("$.errors[0].field").value("input"));
  }

  @Test
  void getTestCases_withFilters_returns200() throws Exception {
    MockTestCaseService.expectedTestCaseId = testCaseId;

    mockMvc
        .perform(
            get("/api/v1/datasets/{datasetId}/test-cases", datasetId)
                .param("sectionName", "Auth")
                .param("priority", "P1")
                .param("enabled", "true")
                .param("source", "MANUAL")
                .param("tag", "auth")
                .param("search", "login")
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].publicId").value(testCaseId.toString()));

    assertThat(MockTestCaseService.lastFilter.sectionName()).isEqualTo("Auth");
    assertThat(MockTestCaseService.lastFilter.priority()).isEqualTo(TestPriority.P1);
    assertThat(MockTestCaseService.lastFilter.enabled()).isTrue();
    assertThat(MockTestCaseService.lastFilter.source()).isEqualTo(TestCaseSource.MANUAL);
    assertThat(MockTestCaseService.lastFilter.tag()).isEqualTo("auth");
    assertThat(MockTestCaseService.lastFilter.search()).isEqualTo("login");
  }

  @Test
  void getTestCase_notFound_returns404() throws Exception {
    MockTestCaseService.throwNotFound = true;

    mockMvc
        .perform(get("/api/v1/test-cases/{testCaseId}", testCaseId).with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("TEST_CASE_NOT_FOUND"));
  }

  @Test
  void updateTestCase_validRequest_returns200() throws Exception {
    UpdateTestCaseRequest request =
        new UpdateTestCaseRequest(null, null, "Updated", null, null, null, null, null, null, null, null, null, null);
    MockTestCaseService.expectedTestCaseId = testCaseId;

    mockMvc
        .perform(
            put("/api/v1/test-cases/{testCaseId}", testCaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated"));
  }

  @Test
  void deleteTestCase_returns204() throws Exception {
    mockMvc
        .perform(delete("/api/v1/test-cases/{testCaseId}", testCaseId).with(currentJwt()))
        .andExpect(status().isNoContent());

    assertThat(MockTestCaseService.deleted).isTrue();
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

  static class MockTestCaseService implements TestCaseService {
    static UUID expectedTestCaseId = UUID.randomUUID();
    static boolean throwNotFound = false;
    static boolean deleted = false;
    static TestCaseFilter lastFilter;

    static void reset() {
      expectedTestCaseId = UUID.randomUUID();
      throwNotFound = false;
      deleted = false;
      lastFilter = null;
    }

    private TestCaseResponse response(String input, String name) {
      return TestCaseResponse.builder()
          .publicId(expectedTestCaseId)
          .datasetPublicId(UUID.randomUUID())
          .input(input)
          .name(name)
          .priority(TestPriority.P2)
          .enabled(true)
          .source(TestCaseSource.MANUAL)
          .build();
    }

    @Override
    public TestCaseResponse createTestCase(UUID datasetPublicId, CreateTestCaseRequest request, String username) {
      return response(request.input(), request.name());
    }

    @Override
    public TestCaseResponse getTestCase(UUID publicId) {
      if (throwNotFound) {
        throw new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND);
      }
      return response("Question", "Name");
    }

    @Override
    public Page<TestCaseResponse> getTestCases(UUID datasetPublicId, TestCaseFilter filter, Pageable pageable) {
      lastFilter = filter;
      return new PageImpl<>(List.of(response("Question", "Name")), pageable, 1);
    }

    @Override
    public TestCaseResponse updateTestCase(UUID publicId, UpdateTestCaseRequest request, String username) {
      return response("Question", request.name());
    }

    @Override
    public void deleteTestCase(UUID publicId, String username) {
      deleted = true;
    }
  }
}

package vn.vinfast.aitesthub.rubric.controller;

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
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.rubric.request.CreateRubricRequest;
import vn.vinfast.aitesthub.rubric.request.RubricFilter;
import vn.vinfast.aitesthub.rubric.request.UpdateRubricRequest;
import vn.vinfast.aitesthub.rubric.response.RubricResponse;
import vn.vinfast.aitesthub.rubric.service.RubricService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@WebMvcTest(
    controllers = RubricController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, RubricControllerTest.Config.class})
class RubricControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    RubricService rubricService() {
      return new MockRubricService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID projectId = UUID.randomUUID();
  private final UUID rubricId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockRubricService.reset();
    SecurityContextHolder.clearContext();
  }

  @Test
  void createRubric_validRequest_returns201() throws Exception {
    CreateRubricRequest request =
        new CreateRubricRequest(
            "Answer Quality",
            null,
            RubricScope.PROJECT,
            null,
            RubricCategory.ANSWER_QUALITY,
            "vi",
            "PASS if correct.",
            BigDecimal.valueOf(0.8),
            null);
    MockRubricService.expectedRubricId = rubricId;

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/rubrics", projectId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.publicId").value(rubricId.toString()))
        .andExpect(jsonPath("$.name").value("Answer Quality"));
  }

  @Test
  void createRubric_missingContent_returns400() throws Exception {
    CreateRubricRequest request =
        new CreateRubricRequest("Answer Quality", null, null, null, null, null, "", null, null);

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/rubrics", projectId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        .andExpect(jsonPath("$.errors[0].field").value("content"));
  }

  @Test
  void getProjectRubrics_withFilters_returns200() throws Exception {
    MockRubricService.expectedRubricId = rubricId;

    mockMvc
        .perform(
            get("/api/v1/projects/{projectId}/rubrics", projectId)
                .param("category", "ANSWER_QUALITY")
                .param("scope", "PROJECT")
                .param("search", "answer")
                .param("archived", "false")
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].publicId").value(rubricId.toString()));

    assertThat(MockRubricService.lastFilter.category()).isEqualTo(RubricCategory.ANSWER_QUALITY);
    assertThat(MockRubricService.lastFilter.scope()).isEqualTo(RubricScope.PROJECT);
    assertThat(MockRubricService.lastFilter.search()).isEqualTo("answer");
    assertThat(MockRubricService.lastFilter.archived()).isFalse();
  }

  @Test
  void getGlobalRubrics_returns200() throws Exception {
    MockRubricService.expectedRubricId = rubricId;

    mockMvc
        .perform(
            get("/api/v1/rubrics/global")
                .param("category", "NO_HALLUCINATION")
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].scope").value("GLOBAL"));

    assertThat(MockRubricService.lastFilter.category()).isEqualTo(RubricCategory.NO_HALLUCINATION);
    assertThat(MockRubricService.lastFilter.scope()).isEqualTo(RubricScope.GLOBAL);
  }

  @Test
  void getRubric_notFound_returns404() throws Exception {
    MockRubricService.throwNotFound = true;

    mockMvc
        .perform(get("/api/v1/rubrics/{rubricId}", rubricId).with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("RUBRIC_NOT_FOUND"));
  }

  @Test
  void updateRubric_validRequest_returns200() throws Exception {
    UpdateRubricRequest request =
        new UpdateRubricRequest("Updated", null, null, null, null, null, null, null);
    MockRubricService.expectedRubricId = rubricId;

    mockMvc
        .perform(
            put("/api/v1/rubrics/{rubricId}", rubricId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated"));
  }

  @Test
  void deleteRubric_returns204() throws Exception {
    mockMvc
        .perform(delete("/api/v1/rubrics/{rubricId}", rubricId).with(currentJwt()))
        .andExpect(status().isNoContent());

    assertThat(MockRubricService.archived).isTrue();
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

  static class MockRubricService implements RubricService {
    static UUID expectedRubricId = UUID.randomUUID();
    static boolean throwNotFound = false;
    static boolean archived = false;
    static RubricFilter lastFilter;

    static void reset() {
      expectedRubricId = UUID.randomUUID();
      throwNotFound = false;
      archived = false;
      lastFilter = null;
    }

    private RubricResponse response(String name, RubricScope scope) {
      return RubricResponse.builder()
          .publicId(expectedRubricId)
          .projectPublicId(UUID.randomUUID())
          .scope(scope)
          .name(name)
          .category(RubricCategory.ANSWER_QUALITY)
          .language("vi")
          .content("PASS")
          .defaultThreshold(BigDecimal.valueOf(0.8))
          .build();
    }

    @Override
    public RubricResponse createRubric(
        UUID projectPublicId, CreateRubricRequest request, String username) {
      return response(request.name(), request.scope() == null ? RubricScope.PROJECT : request.scope());
    }

    @Override
    public RubricResponse getRubric(UUID publicId) {
      if (throwNotFound) {
        throw new ResourceException(ErrorCode.RUBRIC_NOT_FOUND);
      }
      return response("Answer Quality", RubricScope.PROJECT);
    }

    @Override
    public Page<RubricResponse> getRubricsByProject(
        UUID projectPublicId, RubricFilter filter, Pageable pageable) {
      lastFilter = filter;
      return new PageImpl<>(List.of(response("Answer Quality", RubricScope.PROJECT)), pageable, 1);
    }

    @Override
    public Page<RubricResponse> getGlobalRubrics(RubricFilter filter, Pageable pageable) {
      lastFilter = filter;
      return new PageImpl<>(List.of(response("No Hallucination", RubricScope.GLOBAL)), pageable, 1);
    }

    @Override
    public RubricResponse updateRubric(
        UUID publicId, UpdateRubricRequest request, String username) {
      return response(request.name(), RubricScope.PROJECT);
    }

    @Override
    public void archiveRubric(UUID publicId, String username) {
      archived = true;
    }
  }
}

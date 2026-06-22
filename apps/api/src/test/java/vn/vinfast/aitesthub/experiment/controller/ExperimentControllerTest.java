package vn.vinfast.aitesthub.experiment.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.experiment.enums.ExperimentStatus;
import vn.vinfast.aitesthub.experiment.request.CreateExperimentRequest;
import vn.vinfast.aitesthub.experiment.response.ExperimentResponse;
import vn.vinfast.aitesthub.experiment.response.ExperimentVariantResponse;
import vn.vinfast.aitesthub.experiment.service.ExperimentService;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;
import vn.vinfast.aitesthub.result.response.RunComparisonRunSummary;
import vn.vinfast.aitesthub.result.response.RunComparisonSummary;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@WebMvcTest(
    controllers = ExperimentController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, ExperimentControllerTest.Config.class})
class ExperimentControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    ExperimentService experimentService() {
      return new MockExperimentService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final UUID projectId = UUID.randomUUID();
  private final UUID experimentId = UUID.randomUUID();
  private final String username = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockExperimentService.expectedExperimentId = experimentId;
    MockExperimentService.started = false;
    SecurityContextHolder.clearContext();
  }

  @Test
  void createExperiment_returnsCreatedDraft() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/experiments", projectId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "datasetId": "11111111-1111-1111-1111-111111111111",
                      "name": "Prompt comparison",
                      "runMode": "FULL_DATASET",
                      "variants": [
                        {"variantKey": "A", "name": "Baseline", "targetId": "22222222-2222-2222-2222-222222222222"},
                        {"variantKey": "B", "name": "Candidate", "targetId": "33333333-3333-3333-3333-333333333333"}
                      ]
                    }
                    """)
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.publicId").value(experimentId.toString()))
        .andExpect(jsonPath("$.status").value("DRAFT"))
        .andExpect(jsonPath("$.variants[0].variantKey").value("A"));
  }

  @Test
  void startExperiment_returnsAcceptedRunningExperiment() throws Exception {
    mockMvc
        .perform(post("/api/v1/experiments/{experimentId}/start", experimentId).with(currentJwt()))
        .andExpect(status().isAccepted())
        .andExpect(jsonPath("$.status").value("RUNNING"));
  }

  @Test
  void compareExperiment_returnsComparisonSummary() throws Exception {
    mockMvc
        .perform(get("/api/v1/experiments/{experimentId}/comparison", experimentId).with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.summary.regressions").value(1));
  }

  private RequestPostProcessor currentJwt() {
    return request -> {
      Jwt jwt =
          Jwt.withTokenValue("mock-token")
              .header("alg", "none")
              .claim("sub", username)
              .subject(username)
              .build();
      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(new TestingAuthenticationToken(jwt, null));
      SecurityContextHolder.setContext(securityContext);
      return request;
    };
  }

  static class MockExperimentService implements ExperimentService {
    static UUID expectedExperimentId = UUID.randomUUID();
    static boolean started = false;

    @Override
    public ExperimentResponse create(UUID projectId, CreateExperimentRequest request, String username) {
      return response(ExperimentStatus.DRAFT);
    }

    @Override
    public Page<ExperimentResponse> listByProject(UUID projectId, Pageable pageable) {
      return new PageImpl<>(List.of(response(ExperimentStatus.DRAFT)), pageable, 1);
    }

    @Override
    public ExperimentResponse get(UUID experimentId) {
      return response(ExperimentStatus.DRAFT);
    }

    @Override
    public ExperimentResponse start(UUID experimentId, String username) {
      started = true;
      return response(ExperimentStatus.RUNNING);
    }

    @Override
    public RunComparisonResponse compare(UUID experimentId) {
      return RunComparisonResponse.builder()
          .baseRun(RunComparisonRunSummary.builder().publicId(UUID.randomUUID()).build())
          .candidateRun(RunComparisonRunSummary.builder().publicId(UUID.randomUUID()).build())
          .summary(
              RunComparisonSummary.builder()
                  .totalComparableCases(10)
                  .regressions(1)
                  .fixes(2)
                  .unchanged(7)
                  .basePassRate(new BigDecimal("0.8000"))
                  .candidatePassRate(new BigDecimal("0.9000"))
                  .passRateDelta(new BigDecimal("0.1000"))
                  .build())
          .diffs(List.of())
          .build();
    }

    private ExperimentResponse response(ExperimentStatus status) {
      return ExperimentResponse.builder()
          .publicId(expectedExperimentId)
          .projectPublicId(UUID.randomUUID())
          .datasetPublicId(UUID.randomUUID())
          .name("Prompt comparison")
          .runMode(RunMode.FULL_DATASET)
          .status(status)
          .createdByPublicId(UUID.randomUUID())
          .variants(
              List.of(
                  ExperimentVariantResponse.builder()
                      .publicId(UUID.randomUUID())
                      .variantKey("A")
                      .name("Baseline")
                      .targetPublicId(UUID.randomUUID())
                      .targetName("v1")
                      .runStatus(status == ExperimentStatus.RUNNING ? RunStatus.RUNNING : null)
                      .createdAt(OffsetDateTime.now())
                      .updatedAt(OffsetDateTime.now())
                      .build()))
          .createdAt(OffsetDateTime.now())
          .updatedAt(OffsetDateTime.now())
          .build();
    }
  }
}

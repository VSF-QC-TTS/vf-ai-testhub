package vn.vinfast.aitesthub.result.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import vn.vinfast.aitesthub.exception.BusinessException;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.response.AssertionResultResponse;
import vn.vinfast.aitesthub.result.response.ManualReviewResponse;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;
import vn.vinfast.aitesthub.result.response.RunComparisonRunSummary;
import vn.vinfast.aitesthub.result.response.RunComparisonSummary;
import vn.vinfast.aitesthub.result.response.RunReportResponse;
import vn.vinfast.aitesthub.result.response.TestResultReportItem;
import vn.vinfast.aitesthub.result.service.RunComparisonService;
import vn.vinfast.aitesthub.result.service.ReportService;
import vn.vinfast.aitesthub.run.enums.RunStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@WebMvcTest(
    controllers = ResultController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, ResultControllerTest.Config.class})
class ResultControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    ReportService reportService() {
      return new MockReportService();
    }

    @Bean
    RunComparisonService runComparisonService() {
      return new MockRunComparisonService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final UUID runId = UUID.randomUUID();
  private final UUID candidateRunId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockReportService.expectedRunId = runId;
    MockReportService.throwNotFound = false;
    MockRunComparisonService.expectedBaseRunId = runId;
    MockRunComparisonService.expectedCandidateRunId = candidateRunId;
    MockRunComparisonService.throwNotComparable = false;
    SecurityContextHolder.clearContext();
  }

  @Test
  void getRunReport_returnsReportShape() throws Exception {
    mockMvc
        .perform(get("/api/v1/runs/{runId}/report", runId).with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.runPublicId").value(runId.toString()))
        .andExpect(jsonPath("$.total").value(2))
        .andExpect(jsonPath("$.passed").value(1))
        .andExpect(jsonPath("$.results[0].finalStatus").value("PASSED"))
        .andExpect(jsonPath("$.results[0].manualReview.finalStatus").value("PASSED"))
        .andExpect(jsonPath("$.results[0].assertionResults[0].status").value("PASSED"));
  }

  @Test
  void getRunResults_returnsOnlyResultList() throws Exception {
    mockMvc
        .perform(get("/api/v1/runs/{runId}/results", runId).with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].testCaseName").value("Case A"))
        .andExpect(jsonPath("$[0].finalStatus").value("PASSED"));
  }

  @Test
  void getRunReport_notFound_returns404() throws Exception {
    MockReportService.throwNotFound = true;

    mockMvc
        .perform(get("/api/v1/runs/{runId}/report", runId).with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("EVALUATION_RUN_NOT_FOUND"));
  }

  @Test
  void compareRuns_returnsComparisonSummary() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/runs/compare")
                .queryParam("baseRunId", runId.toString())
                .queryParam("candidateRunId", candidateRunId.toString())
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.baseRun.publicId").value(runId.toString()))
        .andExpect(jsonPath("$.candidateRun.publicId").value(candidateRunId.toString()))
        .andExpect(jsonPath("$.summary.regressions").value(1))
        .andExpect(jsonPath("$.summary.fixes").value(2));
  }

  @Test
  void compareRuns_notComparable_returns422() throws Exception {
    MockRunComparisonService.throwNotComparable = true;

    mockMvc
        .perform(
            get("/api/v1/runs/compare")
                .queryParam("baseRunId", runId.toString())
                .queryParam("candidateRunId", candidateRunId.toString())
                .with(currentJwt()))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.code").value("RUN_COMPARISON_NOT_COMPARABLE"));
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

  static class MockReportService implements ReportService {
    static UUID expectedRunId = UUID.randomUUID();
    static boolean throwNotFound = false;

    @Override
    public RunReportResponse getRunReport(UUID runId) {
      if (throwNotFound) {
        throw new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND);
      }
      UUID testResultId = UUID.randomUUID();
      ManualReviewResponse review =
          ManualReviewResponse.builder()
              .publicId(UUID.randomUUID())
              .testResultPublicId(testResultId)
              .autoStatus(ReviewStatus.FAILED)
              .reviewedStatus(ReviewStatus.PASSED)
              .finalStatus(ReviewStatus.PASSED)
              .reviewedAt(OffsetDateTime.now())
              .build();
      AssertionResultResponse assertion =
          AssertionResultResponse.builder()
              .publicId(UUID.randomUUID())
              .testResultPublicId(testResultId)
              .assertionPublicId(UUID.randomUUID())
              .status(ReviewStatus.PASSED)
              .createdAt(OffsetDateTime.now())
              .build();
      TestResultReportItem item =
          TestResultReportItem.builder()
              .publicId(testResultId)
              .testCasePublicId(UUID.randomUUID())
              .testCaseName("Case A")
              .testCaseInput("Question")
              .autoStatus(ReviewStatus.FAILED)
              .finalStatus(ReviewStatus.PASSED)
              .manualReview(review)
              .assertionResults(List.of(assertion))
              .toolExpectationResults(List.of())
              .createdAt(OffsetDateTime.now())
              .build();
      return RunReportResponse.builder()
          .runPublicId(expectedRunId)
          .total(2)
          .passed(1)
          .failed(1)
          .error(0)
          .skipped(0)
          .uncertain(0)
          .passRate(new BigDecimal("0.5000"))
          .results(List.of(item))
          .build();
    }
  }

  static class MockRunComparisonService implements RunComparisonService {
    static UUID expectedBaseRunId = UUID.randomUUID();
    static UUID expectedCandidateRunId = UUID.randomUUID();
    static boolean throwNotComparable = false;

    @Override
    public RunComparisonResponse compareRuns(UUID baseRunId, UUID candidateRunId) {
      if (throwNotComparable) {
        throw new BusinessException(ErrorCode.RUN_COMPARISON_NOT_COMPARABLE);
      }
      return RunComparisonResponse.builder()
          .baseRun(
              RunComparisonRunSummary.builder()
                  .publicId(expectedBaseRunId)
                  .status(RunStatus.COMPLETED)
                  .build())
          .candidateRun(
              RunComparisonRunSummary.builder()
                  .publicId(expectedCandidateRunId)
                  .status(RunStatus.COMPLETED)
                  .build())
          .summary(
              RunComparisonSummary.builder()
                  .totalComparableCases(10)
                  .regressions(1)
                  .fixes(2)
                  .unchanged(7)
                  .build())
          .diffs(List.of())
          .build();
    }
  }
}

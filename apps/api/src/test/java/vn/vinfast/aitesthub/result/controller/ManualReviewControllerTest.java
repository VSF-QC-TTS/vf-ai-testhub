package vn.vinfast.aitesthub.result.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.request.ManualReviewBatchItem;
import vn.vinfast.aitesthub.result.request.ManualReviewBatchRequest;
import vn.vinfast.aitesthub.result.request.ManualReviewRequest;
import vn.vinfast.aitesthub.result.response.ManualReviewBatchResponse;
import vn.vinfast.aitesthub.result.response.ManualReviewResponse;
import vn.vinfast.aitesthub.result.service.ManualReviewService;
import vn.vinfast.aitesthub.exception.GlobalException;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@WebMvcTest(
    controllers = ManualReviewController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, ManualReviewControllerTest.Config.class})
class ManualReviewControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    ManualReviewService manualReviewService() {
      return new MockManualReviewService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID runId = UUID.randomUUID();
  private final UUID testResultId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockManualReviewService.expectedRunId = runId;
    MockManualReviewService.expectedTestResultId = testResultId;
    MockManualReviewService.lastReviewerUsername = null;
    SecurityContextHolder.clearContext();
  }

  @Test
  void reviewRunResults_validRequest_returnsReviewBatch() throws Exception {
    ManualReviewBatchRequest request =
        new ManualReviewBatchRequest(
            List.of(
                new ManualReviewBatchItem(
                    testResultId, ReviewStatus.PASSED, "Acceptable after QC")));

    mockMvc
        .perform(
            post("/api/v1/runs/{runId}/review", runId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.runPublicId").value(runId.toString()))
        .andExpect(jsonPath("$.reviewedCount").value(1))
        .andExpect(jsonPath("$.reviews[0].testResultPublicId").value(testResultId.toString()))
        .andExpect(jsonPath("$.reviews[0].finalStatus").value("PASSED"));
  }

  @Test
  void reviewRunResults_emptyReviews_returns400() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/runs/{runId}/review", runId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reviews\":[]}")
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
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

  static class MockManualReviewService implements ManualReviewService {
    static UUID expectedRunId = UUID.randomUUID();
    static UUID expectedTestResultId = UUID.randomUUID();
    static String lastReviewerUsername;

    @Override
    public ManualReviewResponse reviewResult(
        UUID testResultId, ManualReviewRequest request, String reviewerUsername) {
      lastReviewerUsername = reviewerUsername;
      return response(testResultId, request.reviewedStatus(), request.reviewerNote());
    }

    @Override
    public ManualReviewBatchResponse reviewRunResults(
        UUID runId, ManualReviewBatchRequest request, String reviewerUsername) {
      lastReviewerUsername = reviewerUsername;
      List<ManualReviewResponse> reviews =
          request.reviews().stream()
              .map(item -> response(item.testResultId(), item.reviewedStatus(), item.reviewerNote()))
              .toList();
      return ManualReviewBatchResponse.builder()
          .runPublicId(expectedRunId)
          .reviewedCount(reviews.size())
          .reviews(reviews)
          .build();
    }

    private static ManualReviewResponse response(
        UUID testResultId, ReviewStatus reviewedStatus, String reviewerNote) {
      return ManualReviewResponse.builder()
          .publicId(UUID.randomUUID())
          .testResultPublicId(testResultId)
          .autoStatus(ReviewStatus.FAILED)
          .autoReason("Assertion failed")
          .reviewedStatus(reviewedStatus)
          .reviewerNote(reviewerNote)
          .reviewedByPublicId(UUID.randomUUID())
          .reviewedAt(OffsetDateTime.now())
          .finalStatus(reviewedStatus)
          .build();
    }
  }
}

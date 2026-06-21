package vn.vinfast.aitesthub.run.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.response.RunResponse;
import vn.vinfast.aitesthub.run.service.RunService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@WebMvcTest(
    controllers = RunController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, RunControllerTest.Config.class})
class RunControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    RunService runService() {
      return new MockRunService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID datasetId = UUID.randomUUID();
  private final UUID targetId = UUID.randomUUID();
  private final UUID runId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockRunService.reset();
    SecurityContextHolder.clearContext();
  }

  @Test
  void triggerRun_validRequest_returns202() throws Exception {
    MockRunService.expectedRunId = runId;
    RunRequest request = new RunRequest(targetId, RunMode.FULL_DATASET, null, null, null, true, true, 3, 30000, 0);

    mockMvc
        .perform(
            post("/api/v1/datasets/{datasetId}/runs", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isAccepted())
        .andExpect(jsonPath("$.publicId").value(runId.toString()))
        .andExpect(jsonPath("$.status").value("RUNNING"));
  }

  @Test
  void triggerRun_missingTarget_returns400() throws Exception {
    String request = "{\"runMode\":\"FULL_DATASET\"}";

    mockMvc
        .perform(
            post("/api/v1/datasets/{datasetId}/runs", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(request)
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
  }

  @Test
  void getRun_notFound_returns404() throws Exception {
    MockRunService.throwNotFound = true;

    mockMvc
        .perform(get("/api/v1/runs/{runId}", runId).with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("EVALUATION_RUN_NOT_FOUND"));
  }

  @Test
  void getRunsByDataset_returnsHistory() throws Exception {
    MockRunService.expectedRunId = runId;

    mockMvc
        .perform(get("/api/v1/datasets/{datasetId}/runs", datasetId).with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].publicId").value(runId.toString()));
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

  static class MockRunService implements RunService {
    static UUID expectedRunId = UUID.randomUUID();
    static boolean throwNotFound = false;

    static void reset() {
      expectedRunId = UUID.randomUUID();
      throwNotFound = false;
    }

    private RunResponse response() {
      return RunResponse.builder()
          .publicId(expectedRunId)
          .projectPublicId(UUID.randomUUID())
          .datasetPublicId(UUID.randomUUID())
          .targetPublicId(UUID.randomUUID())
          .status(RunStatus.RUNNING)
          .runMode(RunMode.FULL_DATASET)
          .includeLlmJudge(true)
          .includeToolExpectations(true)
          .maxConcurrency(3)
          .timeoutMs(30000)
          .retryCount(0)
          .totalTestCases(1)
          .build();
    }

    @Override
    public RunResponse triggerRun(UUID datasetPublicId, RunRequest request, String username) {
      return response();
    }

    @Override
    public RunResponse getRun(UUID publicId) {
      if (throwNotFound) {
        throw new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND);
      }
      return response();
    }

    @Override
    public Page<RunResponse> getRunsByDataset(UUID datasetPublicId, Pageable pageable) {
      return new PageImpl<>(List.of(response()), pageable, 1);
    }
  }
}

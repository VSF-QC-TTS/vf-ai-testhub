package vn.vinfast.aitesthub.testcase.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.testcase.request.ConfirmTestCaseImportRequest;
import vn.vinfast.aitesthub.testcase.response.ImportConfirmResponse;
import vn.vinfast.aitesthub.testcase.response.ImportPreviewResponse;
import vn.vinfast.aitesthub.testcase.response.ImportSampleRow;
import vn.vinfast.aitesthub.testcase.service.TestCaseImportService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@WebMvcTest(
    controllers = TestCaseImportController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, TestCaseImportControllerTest.Config.class})
class TestCaseImportControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    TestCaseImportService testCaseImportService() {
      return new MockImportService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID datasetId = UUID.randomUUID();
  private final UUID previewId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockImportService.reset();
    SecurityContextHolder.clearContext();
  }

  @Test
  void previewImport_csv_returns200() throws Exception {
    MockImportService.previewId = previewId;
    MockMultipartFile file =
        new MockMultipartFile(
            "file",
            "cases.csv",
            "text/csv",
            "id,custom_nlp_sample\nTC001,Question".getBytes());

    mockMvc
        .perform(
            multipart("/api/v1/datasets/{datasetId}/test-cases/import/preview", datasetId)
                .file(file)
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.previewId").value(previewId.toString()))
        .andExpect(jsonPath("$.detectedColumns[0]").value("id"));

    assertThat(MockImportService.previewCalled).isTrue();
  }

  @Test
  void confirmImport_validRequest_returns201() throws Exception {
    MockImportService.previewId = previewId;
    ConfirmTestCaseImportRequest request =
        new ConfirmTestCaseImportRequest(previewId, Map.of("custom_nlp_sample", "input"), true, List.of("imported"));

    mockMvc
        .perform(
            post("/api/v1/datasets/{datasetId}/test-cases/import/confirm", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.previewId").value(previewId.toString()))
        .andExpect(jsonPath("$.importedCount").value(1));
  }

  @Test
  void confirmImport_missingPreviewId_returns400() throws Exception {
    ConfirmTestCaseImportRequest request =
        new ConfirmTestCaseImportRequest(null, null, true, List.of("imported"));

    mockMvc
        .perform(
            post("/api/v1/datasets/{datasetId}/test-cases/import/confirm", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        .andExpect(jsonPath("$.errors[0].field").value("previewId"));
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

  static class MockImportService implements TestCaseImportService {
    static UUID previewId = UUID.randomUUID();
    static boolean previewCalled = false;

    static void reset() {
      previewId = UUID.randomUUID();
      previewCalled = false;
    }

    @Override
    public ImportPreviewResponse previewImport(UUID datasetPublicId, org.springframework.web.multipart.MultipartFile file, String username) {
      previewCalled = true;
      return new ImportPreviewResponse(
          previewId,
          file.getOriginalFilename(),
          1,
          List.of("id", "custom_nlp_sample"),
          Map.of("custom_nlp_sample", "input"),
          List.of(new ImportSampleRow(2, Map.of("id", "TC001", "custom_nlp_sample", "Question"))),
          0,
          List.of(),
          OffsetDateTime.now().plusMinutes(30));
    }

    @Override
    public ImportConfirmResponse confirmImport(UUID datasetPublicId, ConfirmTestCaseImportRequest request, String username) {
      return new ImportConfirmResponse(
          request.previewId(),
          datasetPublicId,
          1,
          1,
          0,
          0,
          List.of(),
          OffsetDateTime.now());
    }
  }
}

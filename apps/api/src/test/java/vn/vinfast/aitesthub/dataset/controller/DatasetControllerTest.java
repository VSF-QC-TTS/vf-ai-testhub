package vn.vinfast.aitesthub.dataset.controller;

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
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;
import vn.vinfast.aitesthub.dataset.service.DatasetService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;

/**
 * @author nghlong3004
 * @since 6/20/2026
 */
@WebMvcTest(
    controllers = DatasetController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, DatasetControllerTest.Config.class})
class DatasetControllerTest {

  @TestConfiguration
  static class Config {
    @Bean
    public DatasetService datasetService() {
      return new MockDatasetService();
    }
  }

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final UUID projectId = UUID.randomUUID();
  private final UUID datasetId = UUID.randomUUID();
  private final String currentUsername = "qc@test.com";

  @BeforeEach
  void setUp() {
    MockDatasetService.reset();
  }

  private org.springframework.test.web.servlet.request.RequestPostProcessor currentJwt() {
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

  @Test
  void createDataset_validRequest_returns201() throws Exception {
    CreateDatasetRequest request = new CreateDatasetRequest("Auth Tests", "Test auth", "Regression", List.of("p1"), null);
    MockDatasetService.expectedDatasetId = datasetId;

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/datasets", projectId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Auth Tests"));
  }

  @Test
  void createDataset_missingName_returns400() throws Exception {
    CreateDatasetRequest request = new CreateDatasetRequest("", null, null, null, null);

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/datasets", projectId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        .andExpect(jsonPath("$.errors[0].field").value("name"));
  }

  @Test
  void getDataset_returns200() throws Exception {
    MockDatasetService.expectedDatasetId = datasetId;
    
    mockMvc
        .perform(
            get("/api/v1/datasets/{datasetId}", datasetId)
                .with(currentJwt()))
        .andExpect(status().isOk());
  }

  @Test
  void getDatasetsByProject_returns200() throws Exception {
    MockDatasetService.expectedDatasetId = datasetId;
    
    mockMvc
        .perform(
            get("/api/v1/projects/{projectId}/datasets", projectId)
                .with(currentJwt()))
        .andExpect(status().isOk());
  }

  @Test
  void updateDataset_validRequest_returns200() throws Exception {
    UpdateDatasetRequest request = new UpdateDatasetRequest("Updated Name", null, null, null, null);
    MockDatasetService.expectedDatasetId = datasetId;

    mockMvc
        .perform(
            put("/api/v1/datasets/{datasetId}", datasetId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated Name"));
  }

  @Test
  void archiveDataset_returns204() throws Exception {
    mockMvc
        .perform(
            delete("/api/v1/datasets/{datasetId}", datasetId)
                .with(currentJwt()))
        .andExpect(status().isNoContent());

    assertThat(MockDatasetService.isArchived).isTrue();
  }

  @Test
  void createDataset_projectNotFound_returns404() throws Exception {
    MockDatasetService.throwProjectNotFound = true;
    
    CreateDatasetRequest request = new CreateDatasetRequest("Auth Tests", "Test auth", "Regression", List.of("p1"), null);

    mockMvc
        .perform(
            post("/api/v1/projects/{projectId}/datasets", projectId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(currentJwt()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("PROJECT_NOT_FOUND"));
  }

  // A simple manual mock to avoid Mockito reset issues in Spring Boot tests
  static class MockDatasetService implements DatasetService {
    static boolean throwProjectNotFound = false;
    static boolean isArchived = false;
    static UUID expectedDatasetId = UUID.randomUUID();

    public static void reset() {
      throwProjectNotFound = false;
      isArchived = false;
      expectedDatasetId = UUID.randomUUID();
    }

    private DatasetResponse defaultResponse(String name) {
      return DatasetResponse.builder()
          .publicId(expectedDatasetId)
          .name(name)
          .build();
    }

    @Override
    public DatasetResponse createDataset(UUID projectPublicId, CreateDatasetRequest request, String username) {
      if (throwProjectNotFound) {
        throw new ResourceException(ErrorCode.PROJECT_NOT_FOUND);
      }
      return defaultResponse(request.name());
    }

    @Override
    public DatasetResponse getDataset(UUID publicId) {
      return defaultResponse("Test Dataset");
    }

    @Override
    public Page<DatasetResponse> getDatasetsByProject(UUID projectPublicId, Pageable pageable) {
      if (throwProjectNotFound) {
        throw new ResourceException(ErrorCode.PROJECT_NOT_FOUND);
      }
      return new PageImpl<>(List.of(defaultResponse("Test Dataset")), pageable, 1);
    }

    @Override
    public DatasetResponse updateDataset(UUID publicId, UpdateDatasetRequest request, String username) {
      return defaultResponse(request.name());
    }

    @Override
    public void archiveDataset(UUID publicId, String username) {
      isArchived = true;
    }
  }
}

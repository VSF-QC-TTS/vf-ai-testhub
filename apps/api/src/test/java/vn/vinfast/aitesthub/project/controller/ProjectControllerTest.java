package vn.vinfast.aitesthub.project.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.request.ProjectRequest;
import vn.vinfast.aitesthub.project.response.ProjectResponse;
import vn.vinfast.aitesthub.project.service.ProjectService;

@WebMvcTest(
    controllers = ProjectController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, ProjectControllerTest.MockBeans.class})
class ProjectControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void resetMock() {
    MockProjectService.reset();
  }

  @Test
  void createProject_Returns201() throws Exception {
    ProjectRequest request = new ProjectRequest("New Project", "Desc");
    UUID id = UUID.randomUUID();
    ProjectResponse response = new ProjectResponse(id, "New Project", "Desc", null, null, false, null, null);

    MockProjectService.createResponse = response;

    mockMvc
        .perform(
            post("/api/v1/projects")
                .principal(new TestingAuthenticationToken("user1", null))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.name").value("New Project"));
        
    assertThat(MockProjectService.ownerUsername).isEqualTo("user1");
  }

  @Test
  void createProject_MissingName_Returns400() throws Exception {
    ProjectRequest request = new ProjectRequest("", "Desc");

    mockMvc
        .perform(
            post("/api/v1/projects")
                .principal(new TestingAuthenticationToken("user1", null))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void getProject_NotFound_Returns404() throws Exception {
    UUID id = UUID.randomUUID();
    MockProjectService.throwOnFindId = true;

    mockMvc
        .perform(
            get("/api/v1/projects/{id}", id)
                .principal(new TestingAuthenticationToken("user1", null)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("PROJECT_NOT_FOUND"));
  }

  @TestConfiguration
  static class MockBeans {
    @Bean
    ProjectService projectService() {
      return new MockProjectService();
    }
  }

  static class MockProjectService implements ProjectService {
    static ProjectResponse createResponse;
    static String ownerUsername;
    static boolean throwOnFindId;

    @Override
    public ProjectResponse create(ProjectRequest request, String ownerUsername) {
      MockProjectService.ownerUsername = ownerUsername;
      return createResponse;
    }

    @Override
    public ProjectResponse findById(UUID id) {
      if (throwOnFindId) {
        throw new ResourceException(ErrorCode.PROJECT_NOT_FOUND);
      }
      return null;
    }

    @Override
    public Page<ProjectResponse> findAll(Pageable pageable) {
      return null;
    }

    @Override
    public ProjectResponse update(UUID id, ProjectRequest request) {
      return null;
    }

    @Override
    public void archive(UUID id) {
    }

    static void reset() {
      createResponse = null;
      ownerUsername = null;
      throwOnFindId = false;
    }
  }
}

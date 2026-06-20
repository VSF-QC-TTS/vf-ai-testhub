package vn.vinfast.aitesthub.target.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
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
import org.springframework.test.web.servlet.MockMvc;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;
import vn.vinfast.aitesthub.target.service.TargetService;

@WebMvcTest(
    controllers = GlobalTargetController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, GlobalTargetControllerTest.MockBeans.class})
class GlobalTargetControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void resetMock() {
    MockTargetService.reset();
  }

  @Test
  void getTarget_validId_shouldReturn200() throws Exception {
    UUID targetId = UUID.randomUUID();
    UUID projectId = UUID.randomUUID();

    TargetResponse response = new TargetResponse(
        targetId, projectId, "Test Target", "dev", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null, OffsetDateTime.now(), OffsetDateTime.now()
    );

    MockTargetService.getTargetResponse = response;

    mockMvc
        .perform(
            get("/api/v1/targets/{targetId}", targetId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.publicId").value(targetId.toString()))
        .andExpect(jsonPath("$.name").value("Test Target"));

    assertThat(MockTargetService.capturedTargetId).isEqualTo(targetId);
  }

  @Test
  void updateTarget_validRequest_shouldReturn200() throws Exception {
    UUID targetId = UUID.randomUUID();
    UUID projectId = UUID.randomUUID();

    TargetRequest request = new TargetRequest(
        projectId, "Updated Target", "prod", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null
    );

    TargetResponse response = new TargetResponse(
        targetId, projectId, "Updated Target", "prod", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null, OffsetDateTime.now(), OffsetDateTime.now()
    );

    MockTargetService.updateTargetResponse = response;

    mockMvc
        .perform(
            put("/api/v1/targets/{targetId}", targetId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.publicId").value(targetId.toString()))
        .andExpect(jsonPath("$.name").value("Updated Target"));

    assertThat(MockTargetService.capturedTargetId).isEqualTo(targetId);
    assertThat(MockTargetService.capturedUpdateRequest.name()).isEqualTo("Updated Target");
  }

  @Test
  void deleteTarget_validId_shouldReturn204() throws Exception {
    UUID targetId = UUID.randomUUID();

    mockMvc
        .perform(
            delete("/api/v1/targets/{targetId}", targetId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNoContent());

    assertThat(MockTargetService.capturedDeleteTargetId).isEqualTo(targetId);
  }

  @TestConfiguration
  static class MockBeans {
    @Bean
    TargetService targetService() {
      return new MockTargetService();
    }
  }

  static class MockTargetService extends TargetService {
    static TargetResponse getTargetResponse;
    static TargetResponse updateTargetResponse;
    static UUID capturedTargetId;
    static UUID capturedDeleteTargetId;
    static TargetRequest capturedUpdateRequest;
    static boolean throwOnAction;

    public MockTargetService() {
      super(null, null, null);
    }

    @Override
    public TargetResponse getTarget(UUID targetId) {
      MockTargetService.capturedTargetId = targetId;
      if (throwOnAction) {
        throw new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND);
      }
      return getTargetResponse;
    }

    @Override
    public TargetResponse updateTarget(UUID targetId, TargetRequest request) {
      MockTargetService.capturedTargetId = targetId;
      MockTargetService.capturedUpdateRequest = request;
      if (throwOnAction) {
        throw new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND);
      }
      return updateTargetResponse;
    }

    @Override
    public void deleteTarget(UUID targetId) {
      MockTargetService.capturedDeleteTargetId = targetId;
      if (throwOnAction) {
        throw new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND);
      }
    }

    static void reset() {
      getTargetResponse = null;
      updateTargetResponse = null;
      capturedTargetId = null;
      capturedDeleteTargetId = null;
      capturedUpdateRequest = null;
      throwOnAction = false;
    }
  }
}

package vn.vinfast.aitesthub.target.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.GlobalException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.enums.MissingFieldBehavior;
import vn.vinfast.aitesthub.target.request.ResponseMappingRequest;
import vn.vinfast.aitesthub.target.response.ResponseMappingResponse;
import vn.vinfast.aitesthub.target.service.ResponseMappingService;

@WebMvcTest(
    controllers = ResponseMappingController.class,
    excludeAutoConfiguration = {
      OAuth2ClientAutoConfiguration.class,
      OAuth2ClientWebSecurityAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalException.class, ResponseMappingControllerTest.MockBeans.class})
class ResponseMappingControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @BeforeEach
  void resetMock() {
    MockResponseMappingService.reset();
  }

  @Test
  void getResponseMapping_validRequest_shouldReturn200() throws Exception {
    UUID targetId = UUID.randomUUID();

    ResponseMappingResponse response = new ResponseMappingResponse(
        "$.answer", null, null, null, null, null, null, null, null, null, null, null, null, null, MissingFieldBehavior.FAIL
    );

    MockResponseMappingService.getResponseMappingResponse = response;

    mockMvc
        .perform(
            get("/api/v1/targets/{targetId}/response-mapping", targetId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.answerPath").value("$.answer"));

    assertThat(MockResponseMappingService.capturedTargetId).isEqualTo(targetId);
  }

  @Test
  void saveResponseMapping_validRequest_shouldReturn200() throws Exception {
    UUID targetId = UUID.randomUUID();

    ResponseMappingRequest request = new ResponseMappingRequest(
        "$.answer", null, null, null, null, null, null, null, null, null, null, null, null, null, MissingFieldBehavior.FAIL
    );

    ResponseMappingResponse response = new ResponseMappingResponse(
        "$.answer", null, null, null, null, null, null, null, null, null, null, null, null, null, MissingFieldBehavior.FAIL
    );

    MockResponseMappingService.saveResponseMappingResponse = response;

    mockMvc
        .perform(
            put("/api/v1/targets/{targetId}/response-mapping", targetId)
                .principal(new TestingAuthenticationToken("user@example.com", null))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.answerPath").value("$.answer"));

    assertThat(MockResponseMappingService.capturedTargetId).isEqualTo(targetId);
    assertThat(MockResponseMappingService.capturedRequest.answerPath()).isEqualTo("$.answer");
  }

  @TestConfiguration
  static class MockBeans {
    @Bean
    ResponseMappingService responseMappingService() {
      return new MockResponseMappingService();
    }
  }

  static class MockResponseMappingService extends ResponseMappingService {
    static ResponseMappingResponse saveResponseMappingResponse;
    static ResponseMappingResponse getResponseMappingResponse;
    static ResponseMappingRequest capturedRequest;
    static UUID capturedTargetId;
    static boolean throwOnSave;

    public MockResponseMappingService() {
      super(null, null, null);
    }

    @Override
    public ResponseMappingResponse getResponseMapping(UUID targetId) {
      capturedTargetId = targetId;
      return getResponseMappingResponse;
    }

    @Override
    public ResponseMappingResponse saveResponseMapping(UUID targetId, ResponseMappingRequest request) {
      capturedTargetId = targetId;
      capturedRequest = request;
      if (throwOnSave) {
        throw new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND);
      }
      return saveResponseMappingResponse;
    }

    static void reset() {
      saveResponseMappingResponse = null;
      getResponseMappingResponse = null;
      capturedRequest = null;
      capturedTargetId = null;
      throwOnSave = false;
    }
  }
}

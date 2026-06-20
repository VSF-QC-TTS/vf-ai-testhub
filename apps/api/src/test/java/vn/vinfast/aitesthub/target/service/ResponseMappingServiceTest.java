package vn.vinfast.aitesthub.target.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.enums.MissingFieldBehavior;
import vn.vinfast.aitesthub.target.mapper.ResponseMappingMapper;
import vn.vinfast.aitesthub.target.repository.ResponseMappingRepository;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.target.request.ResponseMappingRequest;
import vn.vinfast.aitesthub.target.response.ResponseMappingResponse;

@ExtendWith(MockitoExtension.class)
class ResponseMappingServiceTest {

  @Mock
  private ResponseMappingRepository responseMappingRepository;

  @Mock
  private TargetRepository targetRepository;

  @Mock
  private ResponseMappingMapper responseMappingMapper;

  @InjectMocks
  private ResponseMappingService responseMappingService;

  private UUID targetId;
  private Target target;
  private ResponseMapping responseMapping;
  private ResponseMappingRequest request;
  private ResponseMappingResponse response;

  @BeforeEach
  void setUp() {
    targetId = UUID.randomUUID();

    target = Target.builder()
        .id(1L)
        .publicId(targetId)
        .name("Test Target")
        .build();

    responseMapping = ResponseMapping.builder()
        .id(1L)
        .target(target)
        .answerPath("$.choices[0].message.content")
        .missingFieldBehavior(MissingFieldBehavior.FAIL)
        .build();

    request = new ResponseMappingRequest(
        "$.choices[0].message.content", null, null, null, null, null, null, null, null, null, null, null, null, null, MissingFieldBehavior.FAIL
    );

    response = new ResponseMappingResponse(
        "$.choices[0].message.content", null, null, null, null, null, null, null, null, null, null, null, null, null, MissingFieldBehavior.FAIL
    );
  }

  @Test
  void getResponseMapping_mappingExists_shouldReturnMapping() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(responseMappingRepository.findByTarget(target)).thenReturn(Optional.of(responseMapping));
    when(responseMappingMapper.toResponse(responseMapping)).thenReturn(response);

    ResponseMappingResponse result = responseMappingService.getResponseMapping(targetId);

    assertThat(result).isNotNull();
    assertThat(result.answerPath()).isEqualTo("$.choices[0].message.content");
  }

  @Test
  void getResponseMapping_targetNotFound_shouldThrowResourceException() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> responseMappingService.getResponseMapping(targetId))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.TARGET_CONNECTOR_NOT_FOUND.getMessage());
  }

  @Test
  void getResponseMapping_mappingNotFound_shouldReturnEmpty() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(responseMappingRepository.findByTarget(target)).thenReturn(Optional.empty());

    ResponseMappingResponse result = responseMappingService.getResponseMapping(targetId);

    assertThat(result).isNull();
  }

  @Test
  void saveResponseMapping_targetNotFound_shouldThrowResourceException() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> responseMappingService.saveResponseMapping(targetId, request))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.TARGET_CONNECTOR_NOT_FOUND.getMessage());
  }

  @Test
  void saveResponseMapping_mappingExists_shouldUpdateMapping() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(responseMappingRepository.findByTarget(target)).thenReturn(Optional.of(responseMapping));
    when(responseMappingRepository.save(responseMapping)).thenReturn(responseMapping);
    when(responseMappingMapper.toResponse(responseMapping)).thenReturn(response);

    ResponseMappingResponse result = responseMappingService.saveResponseMapping(targetId, request);

    assertThat(result).isNotNull();
    assertThat(result.answerPath()).isEqualTo("$.choices[0].message.content");
    verify(responseMappingMapper).updateEntityFromRequest(request, responseMapping);
    verify(responseMappingRepository).save(responseMapping);
  }

  @Test
  void saveResponseMapping_targetExists_shouldCreateOrUpdateMapping() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(responseMappingRepository.findByTarget(target)).thenReturn(Optional.empty());
    when(responseMappingMapper.toEntity(request)).thenReturn(responseMapping);
    when(responseMappingRepository.save(any(ResponseMapping.class))).thenReturn(responseMapping);
    when(responseMappingMapper.toResponse(responseMapping)).thenReturn(response);

    ResponseMappingResponse result = responseMappingService.saveResponseMapping(targetId, request);

    assertThat(result).isNotNull();
    assertThat(result.answerPath()).isEqualTo("$.choices[0].message.content");
    verify(responseMappingRepository).save(any(ResponseMapping.class));
  }
}

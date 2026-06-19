package vn.vinfast.aitesthub.target.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
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
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.mapper.TargetMapper;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;

@ExtendWith(MockitoExtension.class)
class TargetServiceTest {

  @Mock
  private TargetRepository targetRepository;
  
  @Mock
  private ProjectRepository projectRepository;
  
  @Mock
  private TargetMapper targetMapper;

  @InjectMocks
  private TargetService targetService;

  private UUID targetId;
  private UUID projectId;
  private Target target;
  private Project project;
  private TargetRequest targetRequest;
  private TargetResponse targetResponse;

  @BeforeEach
  void setUp() {
    targetId = UUID.randomUUID();
    projectId = UUID.randomUUID();
    
    project = Project.builder()
        .id(1L)
        .publicId(projectId)
        .name("Test Project")
        .build();
        
    target = Target.builder()
        .id(1L)
        .publicId(targetId)
        .name("Test Target")
        .project(project)
        .targetType(TargetType.HTTP)
        .build();
        
    targetRequest = new TargetRequest(
        projectId, "Test Target", "dev", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null
    );
    
    targetResponse = new TargetResponse(
        targetId, projectId, "Test Target", "dev", TargetType.HTTP, null, null, null, null, null, null, null, null, null, null, null, null, 30000, false, null, OffsetDateTime.now(), OffsetDateTime.now()
    );
  }

  @Test
  void getTarget_targetExists_shouldReturnTarget() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(targetMapper.toResponse(target)).thenReturn(targetResponse);

    TargetResponse result = targetService.getTarget(targetId);

    assertThat(result).isNotNull();
    assertThat(result.publicId()).isEqualTo(targetId);
  }

  @Test
  void getTarget_targetNotFound_shouldThrowResourceException() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> targetService.getTarget(targetId))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.TARGET_CONNECTOR_NOT_FOUND.getMessage());
  }

  @Test
  void createTarget_projectExists_shouldCreateTarget() {
    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.of(project));
    when(targetMapper.toEntity(targetRequest)).thenReturn(target);
    when(targetRepository.save(any(Target.class))).thenReturn(target);
    when(targetMapper.toResponse(target)).thenReturn(targetResponse);

    TargetResponse result = targetService.createTarget(targetRequest);

    assertThat(result).isNotNull();
    assertThat(result.name()).isEqualTo("Test Target");
    verify(targetRepository).save(any(Target.class));
  }

  @Test
  void createTarget_projectNotFound_shouldThrowResourceException() {
    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> targetService.createTarget(targetRequest))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.PROJECT_NOT_FOUND.getMessage());
  }
}

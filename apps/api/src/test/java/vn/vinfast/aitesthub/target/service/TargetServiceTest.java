package vn.vinfast.aitesthub.target.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import vn.vinfast.aitesthub.exception.BusinessException;
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
  void getTargets_projectExists_shouldReturnPage() {
    PageRequest pageable = PageRequest.of(0, 10);
    Page<Target> targetPage = new PageImpl<>(List.of(target));

    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.of(project));
    when(targetRepository.findByProjectPublicId(projectId, pageable)).thenReturn(targetPage);
    when(targetMapper.toResponse(target)).thenReturn(targetResponse);

    Page<TargetResponse> result = targetService.getTargets(projectId, pageable);

    assertThat(result).isNotNull();
    assertThat(result.getContent()).hasSize(1);
    assertThat(result.getContent().getFirst().publicId()).isEqualTo(targetId);
  }

  @Test
  void getTargets_projectNotFound_shouldThrowResourceException() {
    PageRequest pageable = PageRequest.of(0, 10);
    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> targetService.getTargets(projectId, pageable))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.PROJECT_NOT_FOUND.getMessage());
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
  void createTarget_projectExistsAndNameUnique_shouldCreateTarget() {
    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.of(project));
    when(targetRepository.existsByProjectPublicIdAndName(projectId, targetRequest.name())).thenReturn(false);
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

  @Test
  void createTarget_nameAlreadyExists_shouldThrowBusinessException() {
    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.of(project));
    when(targetRepository.existsByProjectPublicIdAndName(projectId, targetRequest.name())).thenReturn(true);

    assertThatThrownBy(() -> targetService.createTarget(targetRequest))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Target name already exists in this project.");
  }

  @Test
  void updateTarget_targetExistsAndNameUnique_shouldUpdateTarget() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(targetRepository.existsByProjectPublicIdAndNameAndPublicIdNot(projectId, targetRequest.name(), targetId)).thenReturn(false);
    when(targetRepository.save(target)).thenReturn(target);
    when(targetMapper.toResponse(target)).thenReturn(targetResponse);

    TargetResponse result = targetService.updateTarget(targetId, targetRequest);

    assertThat(result).isNotNull();
    verify(targetMapper).updateEntityFromRequest(targetRequest, target);
    verify(targetRepository).save(target);
  }

  @Test
  void updateTarget_targetNotFound_shouldThrowResourceException() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> targetService.updateTarget(targetId, targetRequest))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.TARGET_CONNECTOR_NOT_FOUND.getMessage());
  }

  @Test
  void updateTarget_nameAlreadyExists_shouldThrowBusinessException() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));
    when(targetRepository.existsByProjectPublicIdAndNameAndPublicIdNot(projectId, targetRequest.name(), targetId)).thenReturn(true);

    assertThatThrownBy(() -> targetService.updateTarget(targetId, targetRequest))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Target name already exists in this project.");
  }

  @Test
  void deleteTarget_targetExists_shouldDelete() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.of(target));

    targetService.deleteTarget(targetId);

    verify(targetRepository).delete(target);
  }

  @Test
  void deleteTarget_targetNotFound_shouldThrowResourceException() {
    when(targetRepository.findByPublicId(targetId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> targetService.deleteTarget(targetId))
        .isInstanceOf(ResourceException.class)
        .hasMessage(ErrorCode.TARGET_CONNECTOR_NOT_FOUND.getMessage());
  }
}

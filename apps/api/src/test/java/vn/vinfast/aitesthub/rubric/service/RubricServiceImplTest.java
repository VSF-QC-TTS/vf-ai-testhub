package vn.vinfast.aitesthub.rubric.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.rubric.mapper.RubricMapper;
import vn.vinfast.aitesthub.rubric.repository.RubricRepository;
import vn.vinfast.aitesthub.rubric.request.CreateRubricRequest;
import vn.vinfast.aitesthub.rubric.request.RubricFilter;
import vn.vinfast.aitesthub.rubric.request.UpdateRubricRequest;
import vn.vinfast.aitesthub.rubric.response.RubricResponse;
import vn.vinfast.aitesthub.rubric.service.impl.RubricServiceImpl;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class RubricServiceImplTest {

  @Mock private RubricRepository rubricRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private DatasetRepository datasetRepository;
  @Mock private UserRepository userRepository;
  @Spy private RubricMapper rubricMapper = Mappers.getMapper(RubricMapper.class);

  private RubricServiceImpl rubricService;

  private final UUID projectPublicId = UUID.randomUUID();
  private final UUID datasetPublicId = UUID.randomUUID();
  private final String username = "qc@test.com";
  private Project project;
  private Dataset dataset;
  private User user;

  @BeforeEach
  void setUp() {
    rubricService =
        new RubricServiceImpl(
            rubricRepository, projectRepository, datasetRepository, userRepository, rubricMapper);
    user = User.builder().id(1L).publicId(UUID.randomUUID()).username(username).build();
    project = Project.builder().id(10L).publicId(projectPublicId).name("AI Bot").owner(user).build();
    dataset = Dataset.builder().id(20L).publicId(datasetPublicId).name("Regression").project(project).build();
  }

  @Test
  void createRubric_projectScope_success() {
    CreateRubricRequest request =
        new CreateRubricRequest(
            "Answer Quality",
            "Judge quality",
            null,
            null,
            null,
            null,
            "PASS if the answer is correct.",
            null,
            Map.of("owner", "qc"));

    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(project));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(rubricRepository.existsByProjectAndNameAndArchivedFalse(project, "Answer Quality"))
        .thenReturn(false);
    when(rubricRepository.save(any(Rubric.class)))
        .thenAnswer(
            invocation -> {
              Rubric rubric = invocation.getArgument(0);
              rubric.setId(100L);
              rubric.setPublicId(UUID.randomUUID());
              return rubric;
            });

    RubricResponse response = rubricService.createRubric(projectPublicId, request, username);

    assertThat(response.name()).isEqualTo("Answer Quality");
    assertThat(response.scope()).isEqualTo(RubricScope.PROJECT);
    assertThat(response.category()).isEqualTo(RubricCategory.ANSWER_QUALITY);
    assertThat(response.language()).isEqualTo("vi");
    assertThat(response.defaultThreshold()).isEqualByComparingTo(BigDecimal.valueOf(0.8));
    assertThat(response.projectPublicId()).isEqualTo(projectPublicId);
    assertThat(response.createdByPublicId()).isEqualTo(user.getPublicId());

    ArgumentCaptor<Rubric> captor = ArgumentCaptor.forClass(Rubric.class);
    verify(rubricRepository).save(captor.capture());
    assertThat(captor.getValue().getProject()).isEqualTo(project);
    assertThat(captor.getValue().getCreatedBy()).isEqualTo(user);
  }

  @Test
  void createRubric_datasetScope_success() {
    CreateRubricRequest request =
        new CreateRubricRequest(
            "RAG Faithfulness",
            null,
            RubricScope.DATASET,
            datasetPublicId,
            RubricCategory.RAG_FAITHFULNESS,
            "en",
            "PASS if grounded in sources.",
            BigDecimal.valueOf(0.9),
            null);

    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(project));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(rubricRepository.existsByProjectAndNameAndArchivedFalse(project, "RAG Faithfulness"))
        .thenReturn(false);
    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(rubricRepository.save(any(Rubric.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    RubricResponse response = rubricService.createRubric(projectPublicId, request, username);

    assertThat(response.scope()).isEqualTo(RubricScope.DATASET);
    assertThat(response.datasetPublicId()).isEqualTo(datasetPublicId);
    assertThat(response.defaultThreshold()).isEqualByComparingTo(BigDecimal.valueOf(0.9));
  }

  @Test
  void createRubric_duplicateName_throwsException() {
    CreateRubricRequest request =
        new CreateRubricRequest("Answer Quality", null, null, null, null, null, "PASS", null, null);

    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(project));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(rubricRepository.existsByProjectAndNameAndArchivedFalse(project, "Answer Quality"))
        .thenReturn(true);

    assertThatThrownBy(() -> rubricService.createRubric(projectPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "RUBRIC_NAME_EXISTS");
  }

  @Test
  void createRubric_datasetScopeWithoutDataset_throwsException() {
    CreateRubricRequest request =
        new CreateRubricRequest(
            "Dataset Rule", null, RubricScope.DATASET, null, null, null, "PASS", null, null);

    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(project));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(rubricRepository.existsByProjectAndNameAndArchivedFalse(project, "Dataset Rule"))
        .thenReturn(false);

    assertThatThrownBy(() -> rubricService.createRubric(projectPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "RUBRIC_DATASET_REQUIRED");
  }

  @Test
  void getRubricsByProject_delegatesToRepositorySpecification() {
    Rubric rubric =
        Rubric.builder()
            .publicId(UUID.randomUUID())
            .project(project)
            .name("Answer Quality")
            .content("PASS")
            .build();
    var pageable = PageRequest.of(0, 20);
    RubricFilter filter =
        new RubricFilter(RubricCategory.ANSWER_QUALITY, RubricScope.PROJECT, "answer", false);

    when(projectRepository.findByPublicId(projectPublicId)).thenReturn(Optional.of(project));
    when(rubricRepository.findAll(any(Specification.class), any(PageRequest.class)))
        .thenReturn(new PageImpl<>(java.util.List.of(rubric), pageable, 1));

    var response = rubricService.getRubricsByProject(projectPublicId, filter, pageable);

    assertThat(response.getTotalElements()).isEqualTo(1);
    assertThat(response.getContent().getFirst().name()).isEqualTo("Answer Quality");
  }

  @Test
  void updateRubric_archived_throwsException() {
    UUID rubricPublicId = UUID.randomUUID();
    Rubric rubric =
        Rubric.builder()
            .publicId(rubricPublicId)
            .project(project)
            .name("Archived")
            .content("PASS")
            .archived(true)
            .build();
    UpdateRubricRequest request =
        new UpdateRubricRequest("Updated", null, null, null, null, null, null, null);

    when(rubricRepository.findByPublicId(rubricPublicId)).thenReturn(Optional.of(rubric));

    assertThatThrownBy(() -> rubricService.updateRubric(rubricPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.RUBRIC_ARCHIVED.getCode());
  }

  @Test
  void archiveRubric_success() {
    UUID rubricPublicId = UUID.randomUUID();
    Rubric rubric =
        Rubric.builder().publicId(rubricPublicId).project(project).name("Rule").content("PASS").build();

    when(rubricRepository.findByPublicId(rubricPublicId)).thenReturn(Optional.of(rubric));

    rubricService.archiveRubric(rubricPublicId, username);

    assertThat(rubric.isArchived()).isTrue();
  }
}

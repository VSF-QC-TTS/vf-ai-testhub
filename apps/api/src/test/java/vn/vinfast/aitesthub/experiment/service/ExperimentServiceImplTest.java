package vn.vinfast.aitesthub.experiment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.BusinessException;
import vn.vinfast.aitesthub.experiment.entity.Experiment;
import vn.vinfast.aitesthub.experiment.enums.ExperimentStatus;
import vn.vinfast.aitesthub.experiment.repository.ExperimentRepository;
import vn.vinfast.aitesthub.experiment.request.CreateExperimentRequest;
import vn.vinfast.aitesthub.experiment.request.ExperimentVariantRequest;
import vn.vinfast.aitesthub.experiment.service.impl.ExperimentServiceImpl;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.result.service.RunComparisonService;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.response.RunResponse;
import vn.vinfast.aitesthub.run.service.RunService;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@ExtendWith(MockitoExtension.class)
class ExperimentServiceImplTest {

  @Mock private ExperimentRepository experimentRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private DatasetRepository datasetRepository;
  @Mock private TargetRepository targetRepository;
  @Mock private UserRepository userRepository;
  @Mock private RunRepository runRepository;
  @Mock private RunService runService;
  @Mock private RunComparisonService runComparisonService;

  private ExperimentService experimentService;
  private Project project;
  private Dataset dataset;
  private Target targetA;
  private Target targetB;
  private User user;

  private final UUID projectId = UUID.randomUUID();
  private final UUID datasetId = UUID.randomUUID();
  private final UUID targetAId = UUID.randomUUID();
  private final UUID targetBId = UUID.randomUUID();
  private final String username = "qc@test.com";

  @BeforeEach
  void setUp() {
    experimentService =
        new ExperimentServiceImpl(
            experimentRepository,
            projectRepository,
            datasetRepository,
            targetRepository,
            userRepository,
            runRepository,
            runService,
            runComparisonService);
    project = Project.builder().id(1L).publicId(projectId).name("Bot").build();
    dataset = Dataset.builder().id(2L).publicId(datasetId).project(project).name("Regression").build();
    targetA = Target.builder().id(3L).publicId(targetAId).project(project).name("v1").build();
    targetB = Target.builder().id(4L).publicId(targetBId).project(project).name("v2").build();
    user = User.builder().id(5L).publicId(UUID.randomUUID()).username(username).build();
  }

  @Test
  void createExperiment_twoVariants_persistsDraftWithVariants() {
    CreateExperimentRequest request = createRequest();
    UUID experimentId = UUID.randomUUID();

    when(projectRepository.findByPublicId(projectId)).thenReturn(Optional.of(project));
    when(datasetRepository.findByPublicId(datasetId)).thenReturn(Optional.of(dataset));
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(targetRepository.findByPublicId(targetAId)).thenReturn(Optional.of(targetA));
    when(targetRepository.findByPublicId(targetBId)).thenReturn(Optional.of(targetB));
    when(experimentRepository.save(any(Experiment.class)))
        .thenAnswer(
            invocation -> {
              Experiment experiment = invocation.getArgument(0);
              experiment.setId(10L);
              experiment.setPublicId(experimentId);
              experiment.getVariants().forEach(variant -> variant.setPublicId(UUID.randomUUID()));
              return experiment;
            });

    var response = experimentService.create(projectId, request, username);

    ArgumentCaptor<Experiment> captor = ArgumentCaptor.forClass(Experiment.class);
    verify(experimentRepository).save(captor.capture());
    Experiment saved = captor.getValue();
    assertThat(saved.getStatus()).isEqualTo(ExperimentStatus.DRAFT);
    assertThat(saved.getVariants()).hasSize(2);
    assertThat(saved.getVariants()).extracting("variantKey").containsExactly("A", "B");
    assertThat(response.publicId()).isEqualTo(experimentId);
    assertThat(response.variants()).hasSize(2);
  }

  @Test
  void startExperiment_draftExperiment_triggersOneRunPerVariant() {
    Experiment experiment = draftExperiment();
    UUID experimentId = experiment.getPublicId();
    UUID runAId = UUID.randomUUID();
    UUID runBId = UUID.randomUUID();
    Run runA = Run.builder().id(30L).publicId(runAId).dataset(dataset).target(targetA).status(RunStatus.RUNNING).build();
    Run runB = Run.builder().id(31L).publicId(runBId).dataset(dataset).target(targetB).status(RunStatus.RUNNING).build();

    when(experimentRepository.findByPublicId(experimentId)).thenReturn(Optional.of(experiment));
    when(runService.triggerExperimentRun(any(UUID.class), any(RunRequest.class), any(String.class)))
        .thenReturn(runResponse(runAId, targetAId), runResponse(runBId, targetBId));
    when(runRepository.findByPublicId(runAId)).thenReturn(Optional.of(runA));
    when(runRepository.findByPublicId(runBId)).thenReturn(Optional.of(runB));
    when(experimentRepository.save(any(Experiment.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var response = experimentService.start(experimentId, username);

    assertThat(response.status()).isEqualTo(ExperimentStatus.RUNNING);
    assertThat(experiment.getStartedAt()).isNotNull();
    assertThat(experiment.getVariants()).allSatisfy(variant -> assertThat(variant.getRun()).isNotNull());
    verify(runService).triggerExperimentRun(datasetId, runRequestFor(targetAId), username);
    verify(runService).triggerExperimentRun(datasetId, runRequestFor(targetBId), username);
  }

  @Test
  void startExperiment_nonDraftExperiment_throwsBusinessException() {
    Experiment experiment = draftExperiment();
    experiment.setStatus(ExperimentStatus.RUNNING);

    when(experimentRepository.findByPublicId(experiment.getPublicId())).thenReturn(Optional.of(experiment));

    assertThatThrownBy(() -> experimentService.start(experiment.getPublicId(), username))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("draft");
  }

  private CreateExperimentRequest createRequest() {
    return new CreateExperimentRequest(
        datasetId,
        "Prompt comparison",
        "Compare target v1 and v2",
        RunMode.FULL_DATASET,
        List.of(),
        null,
        true,
        true,
        3,
        30000,
        0,
        List.of(
            new ExperimentVariantRequest("A", "Baseline", targetAId, null),
            new ExperimentVariantRequest("B", "Candidate", targetBId, null)));
  }

  private Experiment draftExperiment() {
    CreateExperimentRequest request = createRequest();
    Experiment experiment =
        Experiment.builder()
            .id(10L)
            .publicId(UUID.randomUUID())
            .project(project)
            .dataset(dataset)
            .name(request.name())
            .description(request.description())
            .runMode(request.runMode())
            .selectedCaseIds(request.selectedCaseIds())
            .selectedSection(request.selectedSection())
            .includeLlmJudge(true)
            .includeToolExpectations(true)
            .maxConcurrency(3)
            .timeoutMs(30000)
            .retryCount(0)
            .status(ExperimentStatus.DRAFT)
            .createdBy(user)
            .createdAt(OffsetDateTime.now())
            .updatedAt(OffsetDateTime.now())
            .build();
    experiment.addVariant("A", "Baseline", targetA, null);
    experiment.addVariant("B", "Candidate", targetB, null);
    return experiment;
  }

  private RunResponse runResponse(UUID runId, UUID targetId) {
    return RunResponse.builder()
        .publicId(runId)
        .datasetPublicId(datasetId)
        .targetPublicId(targetId)
        .status(RunStatus.RUNNING)
        .build();
  }

  private RunRequest runRequestFor(UUID targetId) {
    return new RunRequest(targetId, RunMode.FULL_DATASET, List.of(), null, null, true, true, 3, 30000, 0);
  }
}

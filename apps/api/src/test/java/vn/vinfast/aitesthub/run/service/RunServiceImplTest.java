package vn.vinfast.aitesthub.run.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.run.dto.RunSnapshotDto;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.mapper.RunMapper;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.service.impl.RunServiceImpl;
import vn.vinfast.aitesthub.run.stream.RunStreamPublisher;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class RunServiceImplTest {

  @Mock private RunRepository runRepository;
  @Mock private DatasetRepository datasetRepository;
  @Mock private TargetRepository targetRepository;
  @Mock private UserRepository userRepository;
  @Mock private RunSnapshotService runSnapshotService;
  @Mock private RunStreamPublisher runStreamPublisher;
  @Spy private RunMapper runMapper = Mappers.getMapper(RunMapper.class);

  private RunServiceImpl runService;
  private Project project;
  private Dataset dataset;
  private Target target;
  private User user;

  private final UUID datasetPublicId = UUID.randomUUID();
  private final UUID targetPublicId = UUID.randomUUID();
  private final String username = "qc@test.com";

  @BeforeEach
  void setUp() {
    runService =
        new RunServiceImpl(
            runRepository,
            datasetRepository,
            targetRepository,
            userRepository,
            runSnapshotService,
            runStreamPublisher,
            runMapper,
            JsonMapper.builder().addModule(new JavaTimeModule()).build());
    project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    dataset = Dataset.builder().id(2L).publicId(datasetPublicId).project(project).name("Regression").build();
    target =
        Target.builder()
            .id(3L)
            .publicId(targetPublicId)
            .project(project)
            .name("Chat API")
            .targetType(TargetType.HTTP)
            .method(HttpMethod.POST)
            .url("https://bot.test/chat")
            .build();
    user = User.builder().id(4L).publicId(UUID.randomUUID()).username(username).build();
  }

  @Test
  void triggerRun_success_marksRunningAndPublishesSnapshot() {
    RunRequest request =
        new RunRequest(targetPublicId, RunMode.FULL_DATASET, null, null, null, true, true, 3, 30000, 0);
    UUID runPublicId = UUID.randomUUID();

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(targetRepository.findByPublicId(targetPublicId)).thenReturn(Optional.of(target));
    when(runRepository.existsByDatasetAndStatusIn(dataset, List.of(RunStatus.PENDING, RunStatus.RUNNING)))
        .thenReturn(false);
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(runRepository.save(any(Run.class)))
        .thenAnswer(
            invocation -> {
              Run run = invocation.getArgument(0);
              run.setId(10L);
              run.setPublicId(runPublicId);
              run.setCreatedAt(OffsetDateTime.now());
              return run;
            });
    RunSnapshotDto snapshot =
        new RunSnapshotDto(
            runPublicId,
            RunMode.FULL_DATASET,
            project.getPublicId(),
            datasetPublicId,
            new RunSnapshotDto.TargetSnapshot(
                targetPublicId,
                "Chat API",
                "HTTP",
                "POST",
                "https://bot.test/chat",
                Map.of(),
                Map.of(),
                Map.of(),
                Map.of(),
                Map.of(),
                Map.of(),
                30000),
            Map.of(),
            List.of(
                new RunSnapshotDto.TestCaseSnapshot(
                    UUID.randomUUID(),
                    null,
                    null,
                    "Case",
                    "Question",
                    null,
                    null,
                    Map.of(),
                    List.of(),
                    List.of(
                        new RunSnapshotDto.AssertionSnapshot(
                            UUID.randomUUID(),
                            AssertionScope.WHOLE_RESPONSE,
                            AssertionType.llm_rubric,
                            null,
                            null,
                            List.of(),
                            null,
                            null,
                            "Judge",
                            0.8,
                            1.0,
                            SeverityLevel.MAJOR)),
                    List.of())),
            new RunSnapshotDto.RunOptions(true, true, 3, 30000, 0),
            OffsetDateTime.now());
    when(runSnapshotService.assembleSnapshot(any(Run.class))).thenReturn(snapshot);

    var response = runService.triggerRun(datasetPublicId, request, username);

    assertThat(response.status()).isEqualTo(RunStatus.RUNNING);
    assertThat(response.totalTestCases()).isEqualTo(1);
    assertThat(response.llmRubricCount()).isEqualTo(1);
    assertThat(response.estimatedLlmCalls()).isEqualTo(1);
    verify(runStreamPublisher).publishRunJob(snapshot);
  }

  @Test
  void triggerRun_targetFromDifferentProject_throwsException() {
    Project otherProject = Project.builder().id(99L).publicId(UUID.randomUUID()).name("Other").build();
    target.setProject(otherProject);
    RunRequest request = new RunRequest(targetPublicId, null, null, null, null, null, null, null, null, null);

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(targetRepository.findByPublicId(targetPublicId)).thenReturn(Optional.of(target));

    assertThatThrownBy(() -> runService.triggerRun(datasetPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "RUN_TARGET_PROJECT_MISMATCH");
  }

  @Test
  void triggerRun_emptySnapshot_throwsException() {
    RunRequest request = new RunRequest(targetPublicId, null, null, null, null, null, null, null, null, null);

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(targetRepository.findByPublicId(targetPublicId)).thenReturn(Optional.of(target));
    when(runRepository.existsByDatasetAndStatusIn(dataset, List.of(RunStatus.PENDING, RunStatus.RUNNING)))
        .thenReturn(false);
    when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
    when(runRepository.save(any(Run.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(runSnapshotService.assembleSnapshot(any(Run.class)))
        .thenThrow(new ResourceException(vn.vinfast.aitesthub.exception.ErrorCode.DATASET_NO_ACTIVE_CASES));

    assertThatThrownBy(() -> runService.triggerRun(datasetPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "DATASET_NO_ACTIVE_CASES");
  }
}

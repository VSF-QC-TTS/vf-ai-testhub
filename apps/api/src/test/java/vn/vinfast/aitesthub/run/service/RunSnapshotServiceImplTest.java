package vn.vinfast.aitesthub.run.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.assertion.repository.AssertionRepository;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.service.impl.RunSnapshotServiceImpl;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.repository.ResponseMappingRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;
import vn.vinfast.aitesthub.toolexpectation.repository.ToolExpectationRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class RunSnapshotServiceImplTest {

  @Mock private TestCaseRepository testCaseRepository;
  @Mock private AssertionRepository assertionRepository;
  @Mock private ToolExpectationRepository toolExpectationRepository;
  @Mock private ResponseMappingRepository responseMappingRepository;

  private RunSnapshotServiceImpl runSnapshotService;
  private Project project;
  private Dataset dataset;
  private Target target;
  private Run run;
  private TestCase firstCase;
  private TestCase secondCase;

  @BeforeEach
  void setUp() {
    runSnapshotService =
        new RunSnapshotServiceImpl(
            testCaseRepository,
            assertionRepository,
            toolExpectationRepository,
            responseMappingRepository);
    project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    dataset = Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).name("Regression").build();
    target =
        Target.builder()
            .id(3L)
            .publicId(UUID.randomUUID())
            .project(project)
            .name("Chat API")
            .targetType(TargetType.HTTP)
            .method(HttpMethod.POST)
            .url("https://bot.test/chat")
            .headersTemplate(Map.of("Content-Type", "application/json"))
            .timeoutMs(30000)
            .build();
    run =
        Run.builder()
            .id(4L)
            .publicId(UUID.randomUUID())
            .project(project)
            .dataset(dataset)
            .target(target)
            .runMode(RunMode.FULL_DATASET)
            .createdAt(OffsetDateTime.now())
            .includeLlmJudge(true)
            .includeToolExpectations(true)
            .build();
    firstCase =
        TestCase.builder()
            .id(10L)
            .publicId(UUID.randomUUID())
            .dataset(dataset)
            .input("Question 1")
            .variables(Map.of("locale", "vi"))
            .tags(List.of("smoke"))
            .sortOrder(0)
            .enabled(true)
            .build();
    secondCase =
        TestCase.builder()
            .id(11L)
            .publicId(UUID.randomUUID())
            .dataset(dataset)
            .input("Question 2")
            .sortOrder(1)
            .enabled(true)
            .build();
  }

  @Test
  void assembleSnapshot_groupsAssertionsAndToolExpectationsByTestCase() {
    Assertion assertion =
        Assertion.builder()
            .id(100L)
            .publicId(UUID.randomUUID())
            .testCase(firstCase)
            .scope(AssertionScope.FIELD)
            .type(AssertionType.contains)
            .fieldPath("$.answer")
            .expectedValue("VF 8")
            .threshold(BigDecimal.valueOf(0.8))
            .weight(BigDecimal.ONE)
            .severity(SeverityLevel.MAJOR)
            .enabled(true)
            .build();
    ToolExpectation expectation =
        ToolExpectation.builder()
            .id(200L)
            .publicId(UUID.randomUUID())
            .testCase(secondCase)
            .expectationType(ToolExpectationType.TOOL_MUST_BE_CALLED)
            .targetSource(TargetSourceType.normalized_tool_calls)
            .toolName("search_product")
            .threshold(BigDecimal.valueOf(0.8))
            .required(true)
            .severity(SeverityLevel.MAJOR)
            .enabled(true)
            .build();
    ResponseMapping mapping =
        ResponseMapping.builder().target(target).answerPath("$.answer").toolCallsPath("$.tools").build();

    when(testCaseRepository.findByDatasetAndEnabledTrueOrderBySortOrderAsc(dataset))
        .thenReturn(List.of(firstCase, secondCase));
    when(assertionRepository.findByTestCaseInAndEnabledTrue(List.of(firstCase, secondCase)))
        .thenReturn(List.of(assertion));
    when(toolExpectationRepository.findByTestCaseInAndEnabledTrue(List.of(firstCase, secondCase)))
        .thenReturn(List.of(expectation));
    when(responseMappingRepository.findByTarget(target)).thenReturn(Optional.of(mapping));

    var snapshot = runSnapshotService.assembleSnapshot(run);

    assertThat(snapshot.runId()).isEqualTo(run.getPublicId());
    assertThat(snapshot.target().url()).isEqualTo("https://bot.test/chat");
    assertThat(snapshot.responseMapping()).containsEntry("answerPath", "$.answer");
    assertThat(snapshot.testCases()).hasSize(2);
    assertThat(snapshot.testCases().getFirst().assertions()).hasSize(1);
    assertThat(snapshot.testCases().getFirst().toolExpectations()).isEmpty();
    assertThat(snapshot.testCases().get(1).assertions()).isEmpty();
    assertThat(snapshot.testCases().get(1).toolExpectations()).hasSize(1);
    assertThat(snapshot.options().includeLlmJudge()).isTrue();
  }

  @Test
  void assembleSnapshot_emptyDataset_throwsException() {
    when(testCaseRepository.findByDatasetAndEnabledTrueOrderBySortOrderAsc(dataset)).thenReturn(List.of());

    assertThatThrownBy(() -> runSnapshotService.assembleSnapshot(run))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.DATASET_NO_ACTIVE_CASES.getCode());
  }
}

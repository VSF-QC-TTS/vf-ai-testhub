package vn.vinfast.aitesthub.result.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.exception.BusinessException;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.repository.AssertionResultRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.repository.ToolExpectationResultRepository;
import vn.vinfast.aitesthub.result.service.impl.RunComparisonServiceImpl;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@ExtendWith(MockitoExtension.class)
class RunComparisonServiceImplTest {

  @Mock private RunRepository runRepository;
  @Mock private TestResultRepository testResultRepository;
  @Mock private AssertionResultRepository assertionResultRepository;
  @Mock private ToolExpectationResultRepository toolExpectationResultRepository;

  private RunComparisonService comparisonService;
  private Run baseRun;
  private Run candidateRun;
  private Dataset dataset;
  private TestCase regressionCase;
  private TestCase fixedCase;
  private TestCase unchangedCase;

  private final UUID baseRunId = UUID.randomUUID();
  private final UUID candidateRunId = UUID.randomUUID();

  @BeforeEach
  void setUp() {
    comparisonService =
        new RunComparisonServiceImpl(
            runRepository,
            testResultRepository,
            assertionResultRepository,
            toolExpectationResultRepository);
    Project project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    dataset =
        Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).name("Regression").build();
    Target baseTarget =
        Target.builder().id(3L).publicId(UUID.randomUUID()).project(project).name("v1").build();
    Target candidateTarget =
        Target.builder().id(4L).publicId(UUID.randomUUID()).project(project).name("v2").build();
    baseRun =
        Run.builder()
            .id(5L)
            .publicId(baseRunId)
            .project(project)
            .dataset(dataset)
            .target(baseTarget)
            .status(RunStatus.COMPLETED)
            .build();
    candidateRun =
        Run.builder()
            .id(6L)
            .publicId(candidateRunId)
            .project(project)
            .dataset(dataset)
            .target(candidateTarget)
            .status(RunStatus.COMPLETED)
            .build();
    regressionCase = testCase(7L, "TC-1", "Regression", "Question 1");
    fixedCase = testCase(8L, "TC-2", "Fixed", "Question 2");
    unchangedCase = testCase(9L, "TC-3", "Unchanged", "Question 3");
  }

  @Test
  void compareRuns_completedCompatibleRuns_returnsRegressionFixAndUnchangedSummary() {
    TestResult baseRegression = result(10L, baseRun, regressionCase, ReviewStatus.PASSED, 100);
    TestResult candidateRegression = result(11L, candidateRun, regressionCase, ReviewStatus.FAILED, 140);
    TestResult baseFixed = result(12L, baseRun, fixedCase, ReviewStatus.FAILED, 200);
    TestResult candidateFixed = result(13L, candidateRun, fixedCase, ReviewStatus.PASSED, 180);
    TestResult baseUnchanged = result(14L, baseRun, unchangedCase, ReviewStatus.PASSED, 90);
    TestResult candidateUnchanged = result(15L, candidateRun, unchangedCase, ReviewStatus.PASSED, 95);

    when(runRepository.findByPublicId(baseRunId)).thenReturn(Optional.of(baseRun));
    when(runRepository.findByPublicId(candidateRunId)).thenReturn(Optional.of(candidateRun));
    when(testResultRepository.findByRunOrderByTestCaseSortOrderAscIdAsc(baseRun))
        .thenReturn(List.of(baseRegression, baseFixed, baseUnchanged));
    when(testResultRepository.findByRunOrderByTestCaseSortOrderAscIdAsc(candidateRun))
        .thenReturn(List.of(candidateRegression, candidateFixed, candidateUnchanged));
    when(assertionResultRepository.findByTestResultIn(List.of(baseRegression, baseFixed, baseUnchanged)))
        .thenReturn(List.of());
    when(assertionResultRepository.findByTestResultIn(List.of(candidateRegression, candidateFixed, candidateUnchanged)))
        .thenReturn(List.of());
    when(toolExpectationResultRepository.findByTestResultIn(List.of(baseRegression, baseFixed, baseUnchanged)))
        .thenReturn(List.of());
    when(toolExpectationResultRepository.findByTestResultIn(List.of(candidateRegression, candidateFixed, candidateUnchanged)))
        .thenReturn(List.of());

    var response = comparisonService.compareRuns(baseRunId, candidateRunId);

    assertThat(response.baseRun().publicId()).isEqualTo(baseRunId);
    assertThat(response.candidateRun().publicId()).isEqualTo(candidateRunId);
    assertThat(response.summary().totalComparableCases()).isEqualTo(3);
    assertThat(response.summary().regressions()).isEqualTo(1);
    assertThat(response.summary().fixes()).isEqualTo(1);
    assertThat(response.summary().unchanged()).isEqualTo(1);
    assertThat(response.summary().averageLatencyDeltaMs()).isEqualTo(8);
    assertThat(response.diffs())
        .extracting(diff -> diff.statusShift().name())
        .containsExactly("PASS_TO_FAIL", "FAIL_TO_PASS", "UNCHANGED");
  }

  @Test
  void compareRuns_nonTerminalRun_throwsBusinessException() {
    candidateRun.setStatus(RunStatus.RUNNING);

    when(runRepository.findByPublicId(baseRunId)).thenReturn(Optional.of(baseRun));
    when(runRepository.findByPublicId(candidateRunId)).thenReturn(Optional.of(candidateRun));

    assertThatThrownBy(() -> comparisonService.compareRuns(baseRunId, candidateRunId))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("completed");
  }

  @Test
  void compareRuns_missingRun_throwsResourceException() {
    when(runRepository.findByPublicId(baseRunId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> comparisonService.compareRuns(baseRunId, candidateRunId))
        .isInstanceOf(ResourceException.class)
        .hasMessageContaining("No evaluation run found");
  }

  @Test
  void compareRuns_differentDatasets_throwsBusinessException() {
    Dataset otherDataset =
        Dataset.builder().id(20L).publicId(UUID.randomUUID()).name("Other").project(dataset.getProject()).build();
    candidateRun.setDataset(otherDataset);

    when(runRepository.findByPublicId(baseRunId)).thenReturn(Optional.of(baseRun));
    when(runRepository.findByPublicId(candidateRunId)).thenReturn(Optional.of(candidateRun));

    assertThatThrownBy(() -> comparisonService.compareRuns(baseRunId, candidateRunId))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("same dataset");
  }

  private TestCase testCase(Long id, String externalId, String name, String input) {
    return TestCase.builder()
        .id(id)
        .publicId(UUID.randomUUID())
        .dataset(dataset)
        .externalId(externalId)
        .name(name)
        .input(input)
        .sortOrder(id.intValue())
        .build();
  }

  private TestResult result(Long id, Run run, TestCase testCase, ReviewStatus status, int latencyMs) {
    return TestResult.builder()
        .id(id)
        .publicId(UUID.randomUUID())
        .run(run)
        .testCase(testCase)
        .status(status)
        .latencyMs(latencyMs)
        .build();
  }
}

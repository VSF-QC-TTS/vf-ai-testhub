package vn.vinfast.aitesthub.result.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.assertion.repository.AssertionRepository;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.result.entity.AssertionResult;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.entity.ToolExpectationResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.repository.AssertionResultRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.repository.ToolExpectationResultRepository;
import vn.vinfast.aitesthub.result.request.AssertionResultIngestionItem;
import vn.vinfast.aitesthub.result.request.ResultIngestionRequest;
import vn.vinfast.aitesthub.result.request.TestResultIngestionItem;
import vn.vinfast.aitesthub.result.request.ToolExpectationResultIngestionItem;
import vn.vinfast.aitesthub.result.service.impl.ResultIngestionServiceImpl;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;
import vn.vinfast.aitesthub.toolexpectation.repository.ToolExpectationRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@ExtendWith(MockitoExtension.class)
class ResultIngestionServiceImplTest {

  @Mock private RunRepository runRepository;
  @Mock private TestCaseRepository testCaseRepository;
  @Mock private AssertionRepository assertionRepository;
  @Mock private ToolExpectationRepository toolExpectationRepository;
  @Mock private TestResultRepository testResultRepository;
  @Mock private AssertionResultRepository assertionResultRepository;
  @Mock private ToolExpectationResultRepository toolExpectationResultRepository;

  private ResultIngestionServiceImpl resultIngestionService;
  private Run run;
  private TestCase testCase;
  private Assertion assertion;
  private ToolExpectation toolExpectation;

  private final UUID runPublicId = UUID.randomUUID();
  private final UUID testCasePublicId = UUID.randomUUID();
  private final UUID assertionPublicId = UUID.randomUUID();
  private final UUID toolExpectationPublicId = UUID.randomUUID();

  @BeforeEach
  void setUp() {
    resultIngestionService =
        new ResultIngestionServiceImpl(
            runRepository,
            testCaseRepository,
            assertionRepository,
            toolExpectationRepository,
            testResultRepository,
            assertionResultRepository,
            toolExpectationResultRepository);

    Project project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    Dataset dataset =
        Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).name("Regression").build();
    run =
        Run.builder()
            .id(3L)
            .publicId(runPublicId)
            .project(project)
            .dataset(dataset)
            .status(RunStatus.RUNNING)
            .totalTestCases(1)
            .build();
    testCase =
        TestCase.builder()
            .id(4L)
            .publicId(testCasePublicId)
            .dataset(dataset)
            .name("Case")
            .input("hello")
            .build();
    assertion =
        Assertion.builder()
            .id(5L)
            .publicId(assertionPublicId)
            .testCase(testCase)
            .scope(AssertionScope.WHOLE_RESPONSE)
            .type(AssertionType.equals)
            .severity(SeverityLevel.CRITICAL)
            .build();
    toolExpectation =
        ToolExpectation.builder()
            .id(6L)
            .publicId(toolExpectationPublicId)
            .testCase(testCase)
            .expectationType(ToolExpectationType.TOOL_MUST_BE_CALLED)
            .toolName("searchInventory")
            .build();
  }

  @Test
  void ingestRunResults_finalBatch_savesResultsAndCompletesRun() {
    ResultIngestionRequest request =
        new ResultIngestionRequest(
            true,
            List.of(
                new TestResultIngestionItem(
                    testCasePublicId,
                    ReviewStatus.PASSED,
                    BigDecimal.ONE,
                    Map.of("input", "hello"),
                    Map.of("body", "ok"),
                    Map.of("answer", "world"),
                    Map.of("component", "answer"),
                    List.of(Map.of("name", "searchInventory")),
                    120,
                    null,
                    List.of(
                        new AssertionResultIngestionItem(
                            assertionPublicId,
                            ReviewStatus.PASSED,
                            "world",
                            "world",
                            "Matched",
                            BigDecimal.ONE,
                            null,
                            Map.of("judge", "rule"))),
                    List.of(
                        new ToolExpectationResultIngestionItem(
                            toolExpectationPublicId,
                            ReviewStatus.PASSED,
                            null,
                            List.of(Map.of("name", "searchInventory")),
                            "router",
                            List.of("searchInventory"),
                            "Called expected tool",
                            BigDecimal.ONE,
                            Map.of("source", "runner"))))));

    when(runRepository.findByPublicId(runPublicId)).thenReturn(Optional.of(run));
    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));
    when(testResultRepository.findByRunAndTestCase(run, testCase)).thenReturn(Optional.empty());
    when(testResultRepository.saveAll(any()))
        .thenAnswer(invocation -> new ArrayList<>((List<TestResult>) invocation.getArgument(0)));
    when(assertionRepository.findByPublicId(assertionPublicId)).thenReturn(Optional.of(assertion));
    when(assertionResultRepository.findByTestResultAndAssertion(any(TestResult.class), any(Assertion.class)))
        .thenReturn(Optional.empty());
    when(assertionResultRepository.saveAll(any()))
        .thenAnswer(invocation -> new ArrayList<>((List<AssertionResult>) invocation.getArgument(0)));
    when(toolExpectationRepository.findByPublicId(toolExpectationPublicId))
        .thenReturn(Optional.of(toolExpectation));
    when(toolExpectationResultRepository.findByTestResultAndToolExpectation(
            any(TestResult.class), any(ToolExpectation.class)))
        .thenReturn(Optional.empty());
    when(toolExpectationResultRepository.saveAll(any()))
        .thenAnswer(invocation -> new ArrayList<>((List<ToolExpectationResult>) invocation.getArgument(0)));
    when(testResultRepository.countByRun(run)).thenReturn(1L);
    when(testResultRepository.countByRunAndStatus(run, ReviewStatus.PASSED)).thenReturn(1L);
    when(testResultRepository.countByRunAndStatus(run, ReviewStatus.FAILED)).thenReturn(0L);
    when(testResultRepository.countByRunAndStatus(run, ReviewStatus.ERROR)).thenReturn(0L);
    when(testResultRepository.countByRunAndStatus(run, ReviewStatus.SKIPPED)).thenReturn(0L);
    when(testResultRepository.countByRunAndStatus(run, ReviewStatus.UNCERTAIN)).thenReturn(0L);

    resultIngestionService.ingestRunResults(runPublicId, request);

    ArgumentCaptor<Iterable<TestResult>> testResultCaptor = ArgumentCaptor.forClass(Iterable.class);
    verify(testResultRepository).saveAll(testResultCaptor.capture());
    TestResult savedTestResult = testResultCaptor.getValue().iterator().next();
    assertThat(savedTestResult.getRun()).isEqualTo(run);
    assertThat(savedTestResult.getTestCase()).isEqualTo(testCase);
    assertThat(savedTestResult.getStatus()).isEqualTo(ReviewStatus.PASSED);
    assertThat(savedTestResult.getExtractedToolCalls()).isInstanceOf(List.class);

    ArgumentCaptor<Iterable<AssertionResult>> assertionResultCaptor =
        ArgumentCaptor.forClass(Iterable.class);
    verify(assertionResultRepository).saveAll(assertionResultCaptor.capture());
    AssertionResult savedAssertionResult = assertionResultCaptor.getValue().iterator().next();
    assertThat(savedAssertionResult.getAssertion()).isEqualTo(assertion);
    assertThat(savedAssertionResult.getSeverity()).isEqualTo(SeverityLevel.CRITICAL);

    ArgumentCaptor<Iterable<ToolExpectationResult>> toolResultCaptor =
        ArgumentCaptor.forClass(Iterable.class);
    verify(toolExpectationResultRepository).saveAll(toolResultCaptor.capture());
    ToolExpectationResult savedToolResult = toolResultCaptor.getValue().iterator().next();
    assertThat(savedToolResult.getToolExpectation()).isEqualTo(toolExpectation);
    assertThat(savedToolResult.getExpectedToolName()).isEqualTo("searchInventory");

    assertThat(run.getStatus()).isEqualTo(RunStatus.COMPLETED);
    assertThat(run.getFinishedAt()).isNotNull();
    assertThat(run.getCompletedTestCases()).isEqualTo(1);
    assertThat(run.getPassedCount()).isEqualTo(1);
    assertThat(run.getSummary()).containsEntry("uncertain", 0L);
  }
}

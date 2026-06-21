package vn.vinfast.aitesthub.result.service;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.result.entity.ManualReview;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.mapper.AssertionResultMapper;
import vn.vinfast.aitesthub.result.mapper.ManualReviewMapper;
import vn.vinfast.aitesthub.result.mapper.ToolExpectationResultMapper;
import vn.vinfast.aitesthub.result.repository.AssertionResultRepository;
import vn.vinfast.aitesthub.result.repository.ManualReviewRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.repository.ToolExpectationResultRepository;
import vn.vinfast.aitesthub.result.service.impl.ReportServiceImpl;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

  @Mock private RunRepository runRepository;
  @Mock private TestResultRepository testResultRepository;
  @Mock private AssertionResultRepository assertionResultRepository;
  @Mock private ToolExpectationResultRepository toolExpectationResultRepository;
  @Mock private ManualReviewRepository manualReviewRepository;
  @Spy private AssertionResultMapper assertionResultMapper = Mappers.getMapper(AssertionResultMapper.class);
  @Spy private ToolExpectationResultMapper toolExpectationResultMapper =
      Mappers.getMapper(ToolExpectationResultMapper.class);
  @Spy private ManualReviewMapper manualReviewMapper = Mappers.getMapper(ManualReviewMapper.class);

  private ReportServiceImpl reportService;
  private Run run;
  private TestResult failedResult;
  private TestResult passedResult;
  private TestResult errorResult;

  private final UUID runPublicId = UUID.randomUUID();

  @BeforeEach
  void setUp() {
    reportService =
        new ReportServiceImpl(
            runRepository,
            testResultRepository,
            assertionResultRepository,
            toolExpectationResultRepository,
            manualReviewRepository,
            assertionResultMapper,
            toolExpectationResultMapper,
            manualReviewMapper);

    Project project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    Dataset dataset =
        Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).name("Regression").build();
    run =
        Run.builder()
            .id(3L)
            .publicId(runPublicId)
            .project(project)
            .dataset(dataset)
            .status(RunStatus.COMPLETED)
            .build();
    failedResult = buildResult(4L, ReviewStatus.FAILED, "Case A", dataset);
    passedResult = buildResult(5L, ReviewStatus.PASSED, "Case B", dataset);
    errorResult = buildResult(6L, ReviewStatus.ERROR, "Case C", dataset);
  }

  @Test
  void getRunReport_countsFinalStatusesAfterManualReviewOverride() {
    User reviewer = User.builder().id(7L).publicId(UUID.randomUUID()).username("lead@test.com").build();
    ManualReview failedOverride =
        ManualReview.builder()
            .id(8L)
            .publicId(UUID.randomUUID())
            .testResult(failedResult)
            .autoStatus(ReviewStatus.FAILED)
            .reviewedStatus(ReviewStatus.PASSED)
            .reviewerNote("Acceptable answer")
            .reviewedBy(reviewer)
            .reviewedAt(OffsetDateTime.now())
            .finalStatus(ReviewStatus.PASSED)
            .build();
    ManualReview errorOverride =
        ManualReview.builder()
            .id(9L)
            .publicId(UUID.randomUUID())
            .testResult(errorResult)
            .autoStatus(ReviewStatus.ERROR)
            .reviewedStatus(ReviewStatus.UNCERTAIN)
            .reviewerNote("Needs rerun")
            .reviewedBy(reviewer)
            .reviewedAt(OffsetDateTime.now())
            .finalStatus(ReviewStatus.UNCERTAIN)
            .build();
    List<TestResult> results = List.of(failedResult, passedResult, errorResult);

    when(runRepository.findByPublicId(runPublicId)).thenReturn(Optional.of(run));
    when(testResultRepository.findByRunOrderByTestCaseSortOrderAscIdAsc(run)).thenReturn(results);
    when(assertionResultRepository.findByTestResultIn(results)).thenReturn(List.of());
    when(toolExpectationResultRepository.findByTestResultIn(results)).thenReturn(List.of());
    when(manualReviewRepository.findByTestResultIn(results))
        .thenReturn(List.of(failedOverride, errorOverride));

    var report = reportService.getRunReport(runPublicId);

    assertThat(report.total()).isEqualTo(3);
    assertThat(report.passed()).isEqualTo(2);
    assertThat(report.failed()).isZero();
    assertThat(report.error()).isZero();
    assertThat(report.uncertain()).isEqualTo(1);
    assertThat(report.passRate()).isEqualByComparingTo(new BigDecimal("0.6667"));
    assertThat(report.results())
        .extracting(result -> result.finalStatus())
        .containsExactly(ReviewStatus.PASSED, ReviewStatus.PASSED, ReviewStatus.UNCERTAIN);
    assertThat(report.results().getFirst().manualReview()).isNotNull();
  }

  private TestResult buildResult(Long id, ReviewStatus status, String name, Dataset dataset) {
    TestCase testCase =
        TestCase.builder()
            .id(id + 10)
            .publicId(UUID.randomUUID())
            .dataset(dataset)
            .name(name)
            .input("Question " + name)
            .sortOrder(id.intValue())
            .build();
    return TestResult.builder()
        .id(id)
        .publicId(UUID.randomUUID())
        .run(run)
        .testCase(testCase)
        .status(status)
        .score(BigDecimal.ONE)
        .requestSnapshot(Map.of())
        .rawResponse(Map.of())
        .responseSnapshot(Map.of())
        .extractedComponents(Map.of())
        .extractedToolCalls(List.of())
        .createdAt(OffsetDateTime.now())
        .build();
  }
}

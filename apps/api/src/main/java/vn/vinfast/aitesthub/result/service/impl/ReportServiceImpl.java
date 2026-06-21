package vn.vinfast.aitesthub.result.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.result.entity.AssertionResult;
import vn.vinfast.aitesthub.result.entity.ManualReview;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.entity.ToolExpectationResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.mapper.AssertionResultMapper;
import vn.vinfast.aitesthub.result.mapper.ManualReviewMapper;
import vn.vinfast.aitesthub.result.mapper.ToolExpectationResultMapper;
import vn.vinfast.aitesthub.result.repository.AssertionResultRepository;
import vn.vinfast.aitesthub.result.repository.ManualReviewRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.repository.ToolExpectationResultRepository;
import vn.vinfast.aitesthub.result.response.AssertionResultResponse;
import vn.vinfast.aitesthub.result.response.ManualReviewResponse;
import vn.vinfast.aitesthub.result.response.RunReportResponse;
import vn.vinfast.aitesthub.result.response.TestResultReportItem;
import vn.vinfast.aitesthub.result.response.ToolExpectationResultResponse;
import vn.vinfast.aitesthub.result.service.ReportService;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.repository.RunRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

  private final RunRepository runRepository;
  private final TestResultRepository testResultRepository;
  private final AssertionResultRepository assertionResultRepository;
  private final ToolExpectationResultRepository toolExpectationResultRepository;
  private final ManualReviewRepository manualReviewRepository;
  private final AssertionResultMapper assertionResultMapper;
  private final ToolExpectationResultMapper toolExpectationResultMapper;
  private final ManualReviewMapper manualReviewMapper;

  @Override
  public RunReportResponse getRunReport(UUID runId) {
    Run run =
        runRepository
            .findByPublicId(runId)
            .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));
    List<TestResult> testResults = testResultRepository.findByRunOrderByTestCaseSortOrderAscIdAsc(run);
    Map<Long, List<AssertionResultResponse>> assertionsByResult =
        groupAssertions(testResults);
    Map<Long, List<ToolExpectationResultResponse>> toolResultsByResult =
        groupToolExpectations(testResults);
    Map<Long, ManualReview> reviewsByResult = indexManualReviews(testResults);

    List<TestResultReportItem> items =
        testResults.stream()
            .map(
                result ->
                    toReportItem(
                        result,
                        reviewsByResult.get(result.getId()),
                        assertionsByResult.getOrDefault(result.getId(), List.of()),
                        toolResultsByResult.getOrDefault(result.getId(), List.of())))
            .toList();
    Map<ReviewStatus, Integer> counts = countFinalStatuses(items);

    return RunReportResponse.builder()
        .runPublicId(run.getPublicId())
        .total(items.size())
        .passed(counts.get(ReviewStatus.PASSED))
        .failed(counts.get(ReviewStatus.FAILED))
        .error(counts.get(ReviewStatus.ERROR))
        .skipped(counts.get(ReviewStatus.SKIPPED))
        .uncertain(counts.get(ReviewStatus.UNCERTAIN))
        .passRate(calculatePassRate(counts.get(ReviewStatus.PASSED), items.size()))
        .results(items)
        .build();
  }

  private Map<Long, List<AssertionResultResponse>> groupAssertions(List<TestResult> testResults) {
    if (testResults.isEmpty()) {
      return Map.of();
    }
    return assertionResultRepository.findByTestResultIn(testResults).stream()
        .collect(
            Collectors.groupingBy(
                result -> result.getTestResult().getId(),
                Collectors.mapping(assertionResultMapper::toResponse, Collectors.toList())));
  }

  private Map<Long, List<ToolExpectationResultResponse>> groupToolExpectations(
      List<TestResult> testResults) {
    if (testResults.isEmpty()) {
      return Map.of();
    }
    return toolExpectationResultRepository.findByTestResultIn(testResults).stream()
        .collect(
            Collectors.groupingBy(
                result -> result.getTestResult().getId(),
                Collectors.mapping(toolExpectationResultMapper::toResponse, Collectors.toList())));
  }

  private Map<Long, ManualReview> indexManualReviews(List<TestResult> testResults) {
    if (testResults.isEmpty()) {
      return Map.of();
    }
    return manualReviewRepository.findByTestResultIn(testResults).stream()
        .collect(Collectors.toMap(review -> review.getTestResult().getId(), Function.identity()));
  }

  private TestResultReportItem toReportItem(
      TestResult result,
      ManualReview manualReview,
      List<AssertionResultResponse> assertionResults,
      List<ToolExpectationResultResponse> toolExpectationResults) {
    ManualReviewResponse manualReviewResponse =
        manualReview == null ? null : manualReviewMapper.toResponse(manualReview);
    ReviewStatus finalStatus =
        manualReview == null ? result.getStatus() : manualReview.getFinalStatus();
    return TestResultReportItem.builder()
        .publicId(result.getPublicId())
        .testCasePublicId(result.getTestCase().getPublicId())
        .testCaseName(result.getTestCase().getName())
        .testCaseInput(result.getTestCase().getInput())
        .sectionName(result.getTestCase().getSectionName())
        .autoStatus(result.getStatus())
        .finalStatus(finalStatus)
        .score(result.getScore())
        .requestSnapshot(result.getRequestSnapshot())
        .rawResponse(result.getRawResponse())
        .responseSnapshot(result.getResponseSnapshot())
        .extractedComponents(result.getExtractedComponents())
        .extractedToolCalls(result.getExtractedToolCalls())
        .latencyMs(result.getLatencyMs())
        .errorMessage(result.getErrorMessage())
        .manualReview(manualReviewResponse)
        .assertionResults(assertionResults)
        .toolExpectationResults(toolExpectationResults)
        .createdAt(result.getCreatedAt())
        .build();
  }

  private Map<ReviewStatus, Integer> countFinalStatuses(List<TestResultReportItem> items) {
    Map<ReviewStatus, Integer> counts = new EnumMap<>(ReviewStatus.class);
    for (ReviewStatus status : ReviewStatus.values()) {
      counts.put(status, 0);
    }
    for (TestResultReportItem item : items) {
      counts.computeIfPresent(item.finalStatus(), (ignored, count) -> count + 1);
    }
    return counts;
  }

  private BigDecimal calculatePassRate(int passed, int total) {
    if (total == 0) {
      return BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
    }
    return BigDecimal.valueOf(passed).divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP);
  }
}

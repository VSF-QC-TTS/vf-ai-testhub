package vn.vinfast.aitesthub.result.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.BusinessException;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.result.entity.AssertionResult;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.entity.ToolExpectationResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.repository.AssertionResultRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.repository.ToolExpectationResultRepository;
import vn.vinfast.aitesthub.result.response.AssertionComparisonDiff;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;
import vn.vinfast.aitesthub.result.response.RunComparisonRunSummary;
import vn.vinfast.aitesthub.result.response.RunComparisonStatusShift;
import vn.vinfast.aitesthub.result.response.RunComparisonSummary;
import vn.vinfast.aitesthub.result.response.TestCaseComparisonDiff;
import vn.vinfast.aitesthub.result.response.ToolExpectationComparisonDiff;
import vn.vinfast.aitesthub.result.service.RunComparisonService;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RunComparisonServiceImpl implements RunComparisonService {

  private final RunRepository runRepository;
  private final TestResultRepository testResultRepository;
  private final AssertionResultRepository assertionResultRepository;
  private final ToolExpectationResultRepository toolExpectationResultRepository;

  @Override
  public RunComparisonResponse compareRuns(UUID baseRunId, UUID candidateRunId) {
    Run baseRun = findRun(baseRunId);
    Run candidateRun = findRun(candidateRunId);
    validateComparable(baseRun, candidateRun);

    List<TestResult> baseResults = testResultRepository.findByRunOrderByTestCaseSortOrderAscIdAsc(baseRun);
    List<TestResult> candidateResults =
        testResultRepository.findByRunOrderByTestCaseSortOrderAscIdAsc(candidateRun);
    Map<UUID, TestResult> baseByCase = indexByTestCase(baseResults);
    Map<UUID, TestResult> candidateByCase = indexByTestCase(candidateResults);
    Map<Long, Map<UUID, AssertionResult>> baseAssertions = indexAssertions(baseResults);
    Map<Long, Map<UUID, AssertionResult>> candidateAssertions = indexAssertions(candidateResults);
    Map<Long, Map<UUID, ToolExpectationResult>> baseTools = indexToolExpectations(baseResults);
    Map<Long, Map<UUID, ToolExpectationResult>> candidateTools = indexToolExpectations(candidateResults);

    List<TestCaseComparisonDiff> diffs =
        buildDiffs(
            baseByCase,
            candidateByCase,
            baseAssertions,
            candidateAssertions,
            baseTools,
            candidateTools);

    return RunComparisonResponse.builder()
        .baseRun(toRunSummary(baseRun))
        .candidateRun(toRunSummary(candidateRun))
        .summary(toSummary(baseResults, candidateResults, diffs))
        .diffs(diffs)
        .build();
  }

  private Run findRun(UUID runId) {
    return runRepository
        .findByPublicId(runId)
        .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));
  }

  private void validateComparable(Run baseRun, Run candidateRun) {
    if (baseRun.getStatus() != RunStatus.COMPLETED || candidateRun.getStatus() != RunStatus.COMPLETED) {
      throw new BusinessException(
          ErrorCode.RUN_COMPARISON_NOT_READY,
          "Both evaluation runs must be completed before comparison.");
    }
    if (!Objects.equals(baseRun.getDataset().getId(), candidateRun.getDataset().getId())) {
      throw new BusinessException(
          ErrorCode.RUN_COMPARISON_NOT_COMPARABLE,
          "Evaluation runs must belong to the same dataset before comparison.");
    }
    if (!Objects.equals(baseRun.getRunMode(), candidateRun.getRunMode())
        || !Objects.equals(baseRun.getSelectedSection(), candidateRun.getSelectedSection())
        || !new HashSet<>(safeSelectedCaseIds(baseRun))
            .equals(new HashSet<>(safeSelectedCaseIds(candidateRun)))) {
      throw new BusinessException(
          ErrorCode.RUN_COMPARISON_NOT_COMPARABLE,
          "Evaluation runs must use the same dataset scope before comparison.");
    }
  }

  private List<UUID> safeSelectedCaseIds(Run run) {
    return run.getSelectedCaseIds() == null ? List.of() : run.getSelectedCaseIds();
  }

  private Map<UUID, TestResult> indexByTestCase(List<TestResult> results) {
    Map<UUID, TestResult> indexed = new LinkedHashMap<>();
    for (TestResult result : results) {
      indexed.put(result.getTestCase().getPublicId(), result);
    }
    return indexed;
  }

  private Map<Long, Map<UUID, AssertionResult>> indexAssertions(List<TestResult> results) {
    if (results.isEmpty()) {
      return Map.of();
    }
    return assertionResultRepository.findByTestResultIn(results).stream()
        .collect(
            Collectors.groupingBy(
                result -> result.getTestResult().getId(),
                Collectors.toMap(
                    result -> result.getAssertion().getPublicId(),
                    Function.identity(),
                    (left, ignored) -> left,
                    LinkedHashMap::new)));
  }

  private Map<Long, Map<UUID, ToolExpectationResult>> indexToolExpectations(List<TestResult> results) {
    if (results.isEmpty()) {
      return Map.of();
    }
    return toolExpectationResultRepository.findByTestResultIn(results).stream()
        .collect(
            Collectors.groupingBy(
                result -> result.getTestResult().getId(),
                Collectors.toMap(
                    result -> result.getToolExpectation().getPublicId(),
                    Function.identity(),
                    (left, ignored) -> left,
                    LinkedHashMap::new)));
  }

  private List<TestCaseComparisonDiff> buildDiffs(
      Map<UUID, TestResult> baseByCase,
      Map<UUID, TestResult> candidateByCase,
      Map<Long, Map<UUID, AssertionResult>> baseAssertions,
      Map<Long, Map<UUID, AssertionResult>> candidateAssertions,
      Map<Long, Map<UUID, ToolExpectationResult>> baseTools,
      Map<Long, Map<UUID, ToolExpectationResult>> candidateTools) {
    Map<UUID, TestCaseComparisonDiff> diffs = new LinkedHashMap<>();
    for (Map.Entry<UUID, TestResult> entry : baseByCase.entrySet()) {
      TestResult base = entry.getValue();
      TestResult candidate = candidateByCase.get(entry.getKey());
      diffs.put(
          entry.getKey(),
          toCaseDiff(base, candidate, baseAssertions, candidateAssertions, baseTools, candidateTools));
    }
    for (Map.Entry<UUID, TestResult> entry : candidateByCase.entrySet()) {
      if (!diffs.containsKey(entry.getKey())) {
        diffs.put(
            entry.getKey(),
            toCaseDiff(null, entry.getValue(), baseAssertions, candidateAssertions, baseTools, candidateTools));
      }
    }
    return List.copyOf(diffs.values());
  }

  private TestCaseComparisonDiff toCaseDiff(
      TestResult base,
      TestResult candidate,
      Map<Long, Map<UUID, AssertionResult>> baseAssertions,
      Map<Long, Map<UUID, AssertionResult>> candidateAssertions,
      Map<Long, Map<UUID, ToolExpectationResult>> baseTools,
      Map<Long, Map<UUID, ToolExpectationResult>> candidateTools) {
    TestResult representative = base == null ? candidate : base;
    TestCase testCase = representative.getTestCase();
    return TestCaseComparisonDiff.builder()
        .testCasePublicId(testCase.getPublicId())
        .externalId(testCase.getExternalId())
        .testCaseName(testCase.getName())
        .testCaseInput(testCase.getInput())
        .sectionName(testCase.getSectionName())
        .baseStatus(base == null ? null : base.getStatus())
        .candidateStatus(candidate == null ? null : candidate.getStatus())
        .statusShift(statusShift(base == null ? null : base.getStatus(), candidate == null ? null : candidate.getStatus()))
        .baseScore(base == null ? null : base.getScore())
        .candidateScore(candidate == null ? null : candidate.getScore())
        .baseLatencyMs(base == null ? null : base.getLatencyMs())
        .candidateLatencyMs(candidate == null ? null : candidate.getLatencyMs())
        .latencyDeltaMs(latencyDelta(base, candidate))
        .baseErrorMessage(base == null ? null : base.getErrorMessage())
        .candidateErrorMessage(candidate == null ? null : candidate.getErrorMessage())
        .assertionDiffs(compareAssertions(base, candidate, baseAssertions, candidateAssertions))
        .toolExpectationDiffs(compareTools(base, candidate, baseTools, candidateTools))
        .build();
  }

  private List<AssertionComparisonDiff> compareAssertions(
      TestResult base,
      TestResult candidate,
      Map<Long, Map<UUID, AssertionResult>> baseAssertions,
      Map<Long, Map<UUID, AssertionResult>> candidateAssertions) {
    Map<UUID, AssertionResult> baseByAssertion = byResult(base, baseAssertions);
    Map<UUID, AssertionResult> candidateByAssertion = byResult(candidate, candidateAssertions);
    return unionKeys(baseByAssertion.keySet(), candidateByAssertion.keySet()).stream()
        .map(
            assertionId ->
                toAssertionDiff(
                    assertionId, baseByAssertion.get(assertionId), candidateByAssertion.get(assertionId)))
        .toList();
  }

  private AssertionComparisonDiff toAssertionDiff(
      UUID assertionId, AssertionResult base, AssertionResult candidate) {
    AssertionResult representative = base == null ? candidate : base;
    return AssertionComparisonDiff.builder()
        .assertionPublicId(assertionId)
        .fieldPath(representative.getAssertion().getFieldPath())
        .baseStatus(base == null ? null : base.getStatus())
        .candidateStatus(candidate == null ? null : candidate.getStatus())
        .statusShift(statusShift(base == null ? null : base.getStatus(), candidate == null ? null : candidate.getStatus()))
        .expectedValue(representative.getExpectedValue())
        .baseActualValue(base == null ? null : base.getActualValue())
        .candidateActualValue(candidate == null ? null : candidate.getActualValue())
        .baseScore(base == null ? null : base.getScore())
        .candidateScore(candidate == null ? null : candidate.getScore())
        .build();
  }

  private List<ToolExpectationComparisonDiff> compareTools(
      TestResult base,
      TestResult candidate,
      Map<Long, Map<UUID, ToolExpectationResult>> baseTools,
      Map<Long, Map<UUID, ToolExpectationResult>> candidateTools) {
    Map<UUID, ToolExpectationResult> baseByTool = byResult(base, baseTools);
    Map<UUID, ToolExpectationResult> candidateByTool = byResult(candidate, candidateTools);
    return unionKeys(baseByTool.keySet(), candidateByTool.keySet()).stream()
        .map(toolId -> toToolDiff(toolId, baseByTool.get(toolId), candidateByTool.get(toolId)))
        .toList();
  }

  private ToolExpectationComparisonDiff toToolDiff(
      UUID toolExpectationId, ToolExpectationResult base, ToolExpectationResult candidate) {
    ToolExpectationResult representative = base == null ? candidate : base;
    return ToolExpectationComparisonDiff.builder()
        .toolExpectationPublicId(toolExpectationId)
        .expectedToolName(representative.getExpectedToolName())
        .baseStatus(base == null ? null : base.getStatus())
        .candidateStatus(candidate == null ? null : candidate.getStatus())
        .statusShift(statusShift(base == null ? null : base.getStatus(), candidate == null ? null : candidate.getStatus()))
        .baseActualToolCalls(base == null ? null : base.getActualToolCalls())
        .candidateActualToolCalls(candidate == null ? null : candidate.getActualToolCalls())
        .baseScore(base == null ? null : base.getScore())
        .candidateScore(candidate == null ? null : candidate.getScore())
        .build();
  }

  private <T> Map<UUID, T> byResult(TestResult result, Map<Long, Map<UUID, T>> indexed) {
    if (result == null) {
      return Map.of();
    }
    return indexed.getOrDefault(result.getId(), Map.of());
  }

  private List<UUID> unionKeys(Collection<UUID> baseKeys, Collection<UUID> candidateKeys) {
    Map<UUID, UUID> keys = new LinkedHashMap<>();
    baseKeys.forEach(key -> keys.put(key, key));
    candidateKeys.forEach(key -> keys.putIfAbsent(key, key));
    return List.copyOf(keys.keySet());
  }

  private RunComparisonStatusShift statusShift(ReviewStatus baseStatus, ReviewStatus candidateStatus) {
    if (baseStatus == null) {
      return RunComparisonStatusShift.NEW_CASE;
    }
    if (candidateStatus == null) {
      return RunComparisonStatusShift.MISSING_CASE;
    }
    if (baseStatus == ReviewStatus.PASSED && candidateStatus != ReviewStatus.PASSED) {
      return RunComparisonStatusShift.PASS_TO_FAIL;
    }
    if (baseStatus != ReviewStatus.PASSED && candidateStatus == ReviewStatus.PASSED) {
      return RunComparisonStatusShift.FAIL_TO_PASS;
    }
    if (baseStatus == candidateStatus) {
      return RunComparisonStatusShift.UNCHANGED;
    }
    return RunComparisonStatusShift.STATUS_CHANGED;
  }

  private Integer latencyDelta(TestResult base, TestResult candidate) {
    if (base == null || candidate == null || base.getLatencyMs() == null || candidate.getLatencyMs() == null) {
      return null;
    }
    return candidate.getLatencyMs() - base.getLatencyMs();
  }

  private RunComparisonRunSummary toRunSummary(Run run) {
    return RunComparisonRunSummary.builder()
        .publicId(run.getPublicId())
        .datasetPublicId(run.getDataset().getPublicId())
        .datasetName(run.getDataset().getName())
        .targetPublicId(run.getTarget().getPublicId())
        .targetName(run.getTarget().getName())
        .status(run.getStatus())
        .totalTestCases(run.getTotalTestCases())
        .completedTestCases(run.getCompletedTestCases())
        .passedCount(run.getPassedCount())
        .failedCount(run.getFailedCount())
        .errorCount(run.getErrorCount())
        .skippedCount(run.getSkippedCount())
        .startedAt(run.getStartedAt())
        .finishedAt(run.getFinishedAt())
        .build();
  }

  private RunComparisonSummary toSummary(
      List<TestResult> baseResults, List<TestResult> candidateResults, List<TestCaseComparisonDiff> diffs) {
    int regressions = 0;
    int fixes = 0;
    int unchanged = 0;
    int statusChanged = 0;
    int newCases = 0;
    int missingCases = 0;
    int comparable = 0;
    int latencyDeltaSum = 0;
    int latencyDeltaCount = 0;

    for (TestCaseComparisonDiff diff : diffs) {
      switch (diff.statusShift()) {
        case PASS_TO_FAIL -> {
          regressions++;
          comparable++;
        }
        case FAIL_TO_PASS -> {
          fixes++;
          comparable++;
        }
        case UNCHANGED -> {
          unchanged++;
          comparable++;
        }
        case STATUS_CHANGED -> {
          statusChanged++;
          comparable++;
        }
        case NEW_CASE -> newCases++;
        case MISSING_CASE -> missingCases++;
      }
      if (diff.latencyDeltaMs() != null) {
        latencyDeltaSum += diff.latencyDeltaMs();
        latencyDeltaCount++;
      }
    }

    BigDecimal basePassRate = passRate(baseResults);
    BigDecimal candidatePassRate = passRate(candidateResults);
    return RunComparisonSummary.builder()
        .totalComparableCases(comparable)
        .regressions(regressions)
        .fixes(fixes)
        .unchanged(unchanged)
        .statusChanged(statusChanged)
        .newCases(newCases)
        .missingCases(missingCases)
        .basePassRate(basePassRate)
        .candidatePassRate(candidatePassRate)
        .passRateDelta(candidatePassRate.subtract(basePassRate).setScale(4, RoundingMode.HALF_UP))
        .averageLatencyDeltaMs(
            latencyDeltaCount == 0 ? null : Math.round((float) latencyDeltaSum / latencyDeltaCount))
        .build();
  }

  private BigDecimal passRate(List<TestResult> results) {
    if (results.isEmpty()) {
      return BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
    }
    long passed = results.stream().filter(result -> result.getStatus() == ReviewStatus.PASSED).count();
    return BigDecimal.valueOf(passed)
        .divide(BigDecimal.valueOf(results.size()), 4, RoundingMode.HALF_UP);
  }
}

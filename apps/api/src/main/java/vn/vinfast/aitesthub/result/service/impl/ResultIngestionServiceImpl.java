package vn.vinfast.aitesthub.result.service.impl;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.repository.AssertionRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
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
import vn.vinfast.aitesthub.result.service.ResultIngestionService;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.repository.ToolExpectationRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResultIngestionServiceImpl implements ResultIngestionService {

  private static final int CHUNK_SIZE = 100;

  private final RunRepository runRepository;
  private final TestCaseRepository testCaseRepository;
  private final AssertionRepository assertionRepository;
  private final ToolExpectationRepository toolExpectationRepository;
  private final TestResultRepository testResultRepository;
  private final AssertionResultRepository assertionResultRepository;
  private final ToolExpectationResultRepository toolExpectationResultRepository;

  @Override
  @Transactional
  public void ingestRunResults(UUID runId, ResultIngestionRequest request) {
    Run run =
        runRepository
            .findByPublicId(runId)
            .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));

    List<TestResult> savedTestResults = saveTestResults(run, safeList(request.testResults()));
    saveAssertionResults(savedTestResults, safeList(request.testResults()));
    saveToolExpectationResults(savedTestResults, safeList(request.testResults()));

    if (Boolean.TRUE.equals(request.finalBatch())) {
      completeRun(run);
    }
  }

  private List<TestResult> saveTestResults(Run run, List<TestResultIngestionItem> items) {
    List<TestResult> results = new ArrayList<>();
    for (TestResultIngestionItem item : items) {
      TestCase testCase =
          testCaseRepository
              .findByPublicId(item.testCaseId())
              .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));
      assertTestCaseBelongsToRun(run, testCase);
      TestResult result =
          testResultRepository.findByRunAndTestCase(run, testCase).orElseGet(TestResult::new);
      result.setRun(run);
      result.setTestCase(testCase);
      result.setStatus(item.status());
      result.setScore(item.score());
      result.setRequestSnapshot(copyMap(item.requestSnapshot()));
      result.setRawResponse(copyMap(item.rawResponse()));
      result.setResponseSnapshot(copyMap(item.responseSnapshot()));
      result.setExtractedComponents(copyMap(item.extractedComponents()));
      result.setExtractedToolCalls(item.extractedToolCalls() == null ? List.of() : item.extractedToolCalls());
      result.setLatencyMs(item.latencyMs());
      result.setErrorMessage(item.errorMessage());
      results.add(result);
    }
    return saveInChunks(testResultRepository, results);
  }

  private void saveAssertionResults(
      List<TestResult> savedTestResults, List<TestResultIngestionItem> items) {
    Map<UUID, TestResult> resultByCaseId = indexByTestCaseId(savedTestResults);
    List<AssertionResult> results = new ArrayList<>();
    for (TestResultIngestionItem testItem : items) {
      TestResult testResult = resultByCaseId.get(testItem.testCaseId());
      for (AssertionResultIngestionItem item : safeList(testItem.assertionResults())) {
        Assertion assertion =
            assertionRepository
                .findByPublicId(item.assertionId())
                .orElseThrow(() -> new ResourceException(ErrorCode.ASSERTION_NOT_FOUND));
        assertAssertionBelongsToTestResult(assertion, testResult);
        AssertionResult result =
            assertionResultRepository
                .findByTestResultAndAssertion(testResult, assertion)
                .orElseGet(AssertionResult::new);
        result.setTestResult(testResult);
        result.setAssertion(assertion);
        result.setStatus(item.status());
        result.setActualValue(item.actualValue());
        result.setExpectedValue(item.expectedValue());
        result.setReason(item.reason());
        result.setScore(item.score());
        result.setSeverity(item.severity() == null ? assertion.getSeverity() : item.severity());
        result.setMetadata(copyMap(item.metadata()));
        results.add(result);
      }
    }
    saveInChunks(assertionResultRepository, results);
  }

  private void saveToolExpectationResults(
      List<TestResult> savedTestResults, List<TestResultIngestionItem> items) {
    Map<UUID, TestResult> resultByCaseId = indexByTestCaseId(savedTestResults);
    List<ToolExpectationResult> results = new ArrayList<>();
    for (TestResultIngestionItem testItem : items) {
      TestResult testResult = resultByCaseId.get(testItem.testCaseId());
      for (ToolExpectationResultIngestionItem item : safeList(testItem.toolExpectationResults())) {
        ToolExpectation toolExpectation =
            toolExpectationRepository
                .findByPublicId(item.toolExpectationId())
                .orElseThrow(() -> new ResourceException(ErrorCode.TOOL_EXPECTATION_NOT_FOUND));
        assertToolExpectationBelongsToTestResult(toolExpectation, testResult);
        ToolExpectationResult result =
            toolExpectationResultRepository
                .findByTestResultAndToolExpectation(testResult, toolExpectation)
                .orElseGet(ToolExpectationResult::new);
        result.setTestResult(testResult);
        result.setToolExpectation(toolExpectation);
        result.setStatus(item.status());
        result.setExpectedToolName(
            item.expectedToolName() == null ? toolExpectation.getToolName() : item.expectedToolName());
        result.setActualToolCalls(item.actualToolCalls());
        result.setActualAgent(item.actualAgent());
        result.setActualSteps(item.actualSteps());
        result.setReason(item.reason());
        result.setScore(item.score());
        result.setMetadata(copyMap(item.metadata()));
        results.add(result);
      }
    }
    saveInChunks(toolExpectationResultRepository, results);
  }

  private void completeRun(Run run) {
    long completed = testResultRepository.countByRun(run);
    long passed = testResultRepository.countByRunAndStatus(run, ReviewStatus.PASSED);
    long failed = testResultRepository.countByRunAndStatus(run, ReviewStatus.FAILED);
    long error = testResultRepository.countByRunAndStatus(run, ReviewStatus.ERROR);
    long skipped = testResultRepository.countByRunAndStatus(run, ReviewStatus.SKIPPED);
    long uncertain = testResultRepository.countByRunAndStatus(run, ReviewStatus.UNCERTAIN);

    run.setCompletedTestCases(Math.toIntExact(completed));
    run.setPassedCount(Math.toIntExact(passed));
    run.setFailedCount(Math.toIntExact(failed));
    run.setErrorCount(Math.toIntExact(error));
    run.setSkippedCount(Math.toIntExact(skipped));
    run.setStatus(RunStatus.COMPLETED);
    run.setFinishedAt(OffsetDateTime.now());
    run.setSummary(
        Map.of(
            "completed", completed,
            "passed", passed,
            "failed", failed,
            "error", error,
            "skipped", skipped,
            "uncertain", uncertain));
  }

  private Map<UUID, TestResult> indexByTestCaseId(List<TestResult> testResults) {
    Map<UUID, TestResult> indexed = new HashMap<>();
    for (TestResult result : testResults) {
      indexed.put(result.getTestCase().getPublicId(), result);
    }
    return indexed;
  }

  private Map<String, Object> copyMap(Map<String, Object> value) {
    return value == null ? Map.of() : Map.copyOf(value);
  }

  private void assertTestCaseBelongsToRun(Run run, TestCase testCase) {
    if (!run.getDataset().getId().equals(testCase.getDataset().getId())) {
      throw new ResourceException(
          "Result test case does not belong to the run dataset",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RESULT_TEST_CASE_DATASET_MISMATCH");
    }
  }

  private void assertAssertionBelongsToTestResult(Assertion assertion, TestResult testResult) {
    if (!assertion.getTestCase().getId().equals(testResult.getTestCase().getId())) {
      throw new ResourceException(
          "Assertion result does not belong to the test result case",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RESULT_ASSERTION_CASE_MISMATCH");
    }
  }

  private void assertToolExpectationBelongsToTestResult(
      ToolExpectation toolExpectation, TestResult testResult) {
    if (!toolExpectation.getTestCase().getId().equals(testResult.getTestCase().getId())) {
      throw new ResourceException(
          "Tool expectation result does not belong to the test result case",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RESULT_TOOL_EXPECTATION_CASE_MISMATCH");
    }
  }

  private <T> List<T> safeList(List<T> value) {
    return value == null ? List.of() : value;
  }

  private <T> List<T> saveInChunks(JpaRepository<T, Long> repository, List<T> items) {
    if (items.isEmpty()) {
      return List.of();
    }
    List<T> saved = new ArrayList<>(items.size());
    for (int start = 0; start < items.size(); start += CHUNK_SIZE) {
      int end = Math.min(start + CHUNK_SIZE, items.size());
      saved.addAll(repository.saveAll(items.subList(start, end)));
    }
    return saved;
  }
}

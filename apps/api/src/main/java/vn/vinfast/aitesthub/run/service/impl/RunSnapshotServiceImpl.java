package vn.vinfast.aitesthub.run.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.repository.AssertionRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.run.dto.RunSnapshotDto;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.service.RunSnapshotService;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.repository.ResponseMappingRepository;
import vn.vinfast.aitesthub.target.service.TargetSecretService;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.repository.ToolExpectationRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RunSnapshotServiceImpl implements RunSnapshotService {

  private final TestCaseRepository testCaseRepository;
  private final AssertionRepository assertionRepository;
  private final ToolExpectationRepository toolExpectationRepository;
  private final ResponseMappingRepository responseMappingRepository;
  private final TargetSecretService targetSecretService;

  @Override
  public RunSnapshotDto assembleSnapshot(Run run) {
    List<TestCase> testCases = resolveTestCases(run);
    if (testCases.isEmpty()) {
      throw new ResourceException(ErrorCode.DATASET_NO_ACTIVE_CASES);
    }

    Map<Long, List<Assertion>> assertionsByTestCase =
        assertionRepository.findByTestCaseInAndEnabledTrue(testCases).stream()
            .collect(Collectors.groupingBy(assertion -> assertion.getTestCase().getId()));
    Map<Long, List<ToolExpectation>> expectationsByTestCase =
        toolExpectationRepository.findByTestCaseInAndEnabledTrue(testCases).stream()
            .collect(Collectors.groupingBy(expectation -> expectation.getTestCase().getId()));

    Target target = run.getTarget();
    Map<String, Object> responseMapping =
        responseMappingRepository.findByTarget(target).map(this::toResponseMappingSnapshot).orElseGet(Map::of);

    return new RunSnapshotDto(
        run.getPublicId(),
        run.getRunMode(),
        run.getProject().getPublicId(),
        run.getDataset().getPublicId(),
        toTargetSnapshot(target),
        responseMapping,
        testCases.stream()
            .map(testCase -> toTestCaseSnapshot(
                testCase,
                assertionsByTestCase.getOrDefault(testCase.getId(), List.of()),
                expectationsByTestCase.getOrDefault(testCase.getId(), List.of())))
            .toList(),
        new RunSnapshotDto.RunOptions(
            run.isIncludeLlmJudge(),
            run.isIncludeToolExpectations(),
            run.getMaxConcurrency(),
            run.getTimeoutMs(),
            run.getRetryCount()),
        run.getCreatedAt());
  }

  private List<TestCase> resolveTestCases(Run run) {
    if (run.getRunMode() == RunMode.SELECTED_CASES) {
      return testCaseRepository.findByDatasetAndPublicIdInAndEnabledTrueOrderBySortOrderAsc(
          run.getDataset(), run.getSelectedCaseIds());
    }
    if (run.getRunMode() == RunMode.SELECTED_SECTION) {
      return testCaseRepository.findByDatasetAndSectionNameAndEnabledTrueOrderBySortOrderAsc(
          run.getDataset(), run.getSelectedSection());
    }
    return testCaseRepository.findByDatasetAndEnabledTrueOrderBySortOrderAsc(run.getDataset());
  }

  private RunSnapshotDto.TargetSnapshot toTargetSnapshot(Target target) {
    return new RunSnapshotDto.TargetSnapshot(
        target.getPublicId(),
        target.getName(),
        target.getTargetType() == null ? null : target.getTargetType().name(),
        target.getMethod() == null ? null : target.getMethod().name(),
        target.getUrl(),
        nullSafeMap(target.getQueryParamsTemplate()),
        nullSafeMap(target.getHeadersTemplate()),
        nullSafeMap(target.getBodyTemplate()),
        buildSnapshotAuthConfig(target),
        target.getLlmProvider(),
        target.getLlmModel(),
        target.getLlmBaseUrl(),
        target.getLlmKeyRef(),
        nullSafeMap(target.getInputBinding()),
        nullSafeMap(target.getVariableBindings()),
        target.getTimeoutMs());
  }

  private Map<String, Object> buildSnapshotAuthConfig(Target target) {
    Map<String, Object> authConfig = new HashMap<>();
    if (target.getAuthConfig() != null) {
      authConfig.putAll(target.getAuthConfig());
    }
    // Inject decrypted secrets into authConfig for execution
    Map<String, String> secrets = targetSecretService.decryptSecrets(target);
    authConfig.putAll(secrets);
    return authConfig.isEmpty() ? Map.of() : Map.copyOf(authConfig);
  }

  private RunSnapshotDto.TestCaseSnapshot toTestCaseSnapshot(
      TestCase testCase, List<Assertion> assertions, List<ToolExpectation> expectations) {
    return new RunSnapshotDto.TestCaseSnapshot(
        testCase.getPublicId(),
        testCase.getExternalId(),
        testCase.getSectionName(),
        testCase.getName(),
        testCase.getInput(),
        testCase.getExpectedBehavior(),
        testCase.getReferenceAnswer(),
        nullSafeMap(testCase.getVariables()),
        testCase.getTags() == null ? List.of() : List.copyOf(testCase.getTags()),
        assertions.stream().map(this::toAssertionSnapshot).toList(),
        expectations.stream().map(this::toToolExpectationSnapshot).toList());
  }

  private RunSnapshotDto.AssertionSnapshot toAssertionSnapshot(Assertion assertion) {
    return new RunSnapshotDto.AssertionSnapshot(
        assertion.getPublicId(),
        assertion.getScope(),
        assertion.getType(),
        assertion.getTargetComponent(),
        assertion.getFieldPath(),
        assertion.getFieldPaths() == null ? List.of() : List.copyOf(assertion.getFieldPaths()),
        assertion.getExpectedValue(),
        toRubricSnapshot(assertion.getRubric()),
        assertion.getRubricOverride(),
        assertion.getThreshold(),
        assertion.getWeight(),
        assertion.getSeverity());
  }

  private RunSnapshotDto.ToolExpectationSnapshot toToolExpectationSnapshot(ToolExpectation expectation) {
    return new RunSnapshotDto.ToolExpectationSnapshot(
        expectation.getPublicId(),
        expectation.getExpectationType(),
        expectation.getTargetSource(),
        expectation.getToolName(),
        expectation.getAgentName(),
        expectation.getArgumentAssertions() == null ? List.of() : List.copyOf(expectation.getArgumentAssertions()),
        expectation.getSequence() == null ? List.of() : List.copyOf(expectation.getSequence()),
        expectation.getMinCalls(),
        expectation.getMaxCalls(),
        toRubricSnapshot(expectation.getRubric()),
        expectation.getRubricOverride(),
        expectation.getThreshold(),
        expectation.isRequired(),
        expectation.getSeverity());
  }

  private RunSnapshotDto.RubricSnapshot toRubricSnapshot(Rubric rubric) {
    if (rubric == null) {
      return null;
    }
    return new RunSnapshotDto.RubricSnapshot(
        rubric.getPublicId(),
        rubric.getScope() == null ? null : rubric.getScope().name(),
        rubric.getCategory() == null ? null : rubric.getCategory().name(),
        rubric.getLanguage(),
        rubric.getContent(),
        rubric.getDefaultThreshold());
  }

  private Map<String, Object> toResponseMappingSnapshot(ResponseMapping mapping) {
    Map<String, Object> snapshot = new HashMap<>();
    put(snapshot, "answerPath", mapping.getAnswerPath());
    put(snapshot, "suggestionsPath", mapping.getSuggestionsPath());
    put(snapshot, "intentPath", mapping.getIntentPath());
    put(snapshot, "confidencePath", mapping.getConfidencePath());
    put(snapshot, "sourcesPath", mapping.getSourcesPath());
    put(snapshot, "retrievalPath", mapping.getRetrievalPath());
    put(snapshot, "memoryPath", mapping.getMemoryPath());
    put(snapshot, "rewritePath", mapping.getRewritePath());
    put(snapshot, "agentPath", mapping.getAgentPath());
    put(snapshot, "toolPath", mapping.getToolPath());
    put(snapshot, "toolCallsPath", mapping.getToolCallsPath());
    put(snapshot, "traceIdPath", mapping.getTraceIdPath());
    put(snapshot, "latencyPath", mapping.getLatencyPath());
    put(snapshot, "customComponents", mapping.getCustomComponents());
    put(snapshot, "missingFieldBehavior", mapping.getMissingFieldBehavior());
    return snapshot;
  }

  private Map<String, Object> nullSafeMap(Map<String, Object> value) {
    return value == null ? Map.of() : Map.copyOf(value);
  }

  private void put(Map<String, Object> target, String key, Object value) {
    if (value != null) {
      target.put(key, value);
    }
  }
}

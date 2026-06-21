package vn.vinfast.aitesthub.toolexpectation.service.impl;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.rubric.repository.RubricRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;
import vn.vinfast.aitesthub.toolexpectation.mapper.ToolExpectationMapper;
import vn.vinfast.aitesthub.toolexpectation.repository.ToolExpectationRepository;
import vn.vinfast.aitesthub.toolexpectation.request.CreateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.request.UpdateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.response.ToolExpectationResponse;
import vn.vinfast.aitesthub.toolexpectation.service.ToolExpectationService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ToolExpectationServiceImpl implements ToolExpectationService {

  private static final BigDecimal DEFAULT_THRESHOLD = BigDecimal.valueOf(0.8);

  private final ToolExpectationRepository toolExpectationRepository;
  private final TestCaseRepository testCaseRepository;
  private final RubricRepository rubricRepository;
  private final ToolExpectationMapper toolExpectationMapper;

  @Override
  @Transactional
  public ToolExpectationResponse createToolExpectation(
      UUID testCasePublicId, CreateToolExpectationRequest request, String username) {
    TestCase testCase = getActiveTestCase(testCasePublicId);
    validateCreateRequest(request);

    ToolExpectation toolExpectation = toolExpectationMapper.toEntity(request);
    toolExpectation.setTestCase(testCase);
    applyCreateDefaults(toolExpectation, request);
    attachRubric(toolExpectation, testCase, request.rubricId());

    return toolExpectationMapper.toResponse(toolExpectationRepository.save(toolExpectation));
  }

  @Override
  public Page<ToolExpectationResponse> getToolExpectations(UUID testCasePublicId, Pageable pageable) {
    TestCase testCase = testCaseRepository.findByPublicId(testCasePublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));
    return toolExpectationRepository.findByTestCase(testCase, pageable).map(toolExpectationMapper::toResponse);
  }

  @Override
  public ToolExpectationResponse getToolExpectation(UUID publicId) {
    return toolExpectationRepository
        .findByPublicId(publicId)
        .map(toolExpectationMapper::toResponse)
        .orElseThrow(() -> new ResourceException(ErrorCode.TOOL_EXPECTATION_NOT_FOUND));
  }

  @Override
  @Transactional
  public ToolExpectationResponse updateToolExpectation(
      UUID publicId, UpdateToolExpectationRequest request, String username) {
    ToolExpectation toolExpectation = toolExpectationRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TOOL_EXPECTATION_NOT_FOUND));
    ensureActiveTestCase(toolExpectation.getTestCase());

    ToolExpectationType nextType =
        request.expectationType() == null ? toolExpectation.getExpectationType() : request.expectationType();
    validateCombination(
        nextType,
        request.toolName() == null ? toolExpectation.getToolName() : request.toolName(),
        request.agentName() == null ? toolExpectation.getAgentName() : request.agentName(),
        request.argumentAssertions() == null ? toolExpectation.getArgumentAssertions() : request.argumentAssertions(),
        request.sequence() == null ? toolExpectation.getSequence() : request.sequence(),
        request.minCalls() == null ? toolExpectation.getMinCalls() : request.minCalls(),
        request.maxCalls() == null ? toolExpectation.getMaxCalls() : request.maxCalls());

    toolExpectationMapper.updateEntity(request, toolExpectation);
    if (request.rubricId() != null) {
      attachRubric(toolExpectation, toolExpectation.getTestCase(), request.rubricId());
    }
    return toolExpectationMapper.toResponse(toolExpectation);
  }

  @Override
  @Transactional
  public void deleteToolExpectation(UUID publicId, String username) {
    ToolExpectation toolExpectation = toolExpectationRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TOOL_EXPECTATION_NOT_FOUND));
    ensureActiveTestCase(toolExpectation.getTestCase());
    toolExpectationRepository.delete(toolExpectation);
  }

  private TestCase getActiveTestCase(UUID testCasePublicId) {
    TestCase testCase = testCaseRepository.findByPublicId(testCasePublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));
    ensureActiveTestCase(testCase);
    return testCase;
  }

  private void ensureActiveTestCase(TestCase testCase) {
    if (testCase.getDataset().isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
  }

  private void validateCreateRequest(CreateToolExpectationRequest request) {
    validateCombination(
        request.expectationType(),
        request.toolName(),
        request.agentName(),
        request.argumentAssertions(),
        request.sequence(),
        request.minCalls(),
        request.maxCalls());
  }

  private void validateCombination(
      ToolExpectationType type,
      String toolName,
      String agentName,
      java.util.List<java.util.Map<String, Object>> argumentAssertions,
      java.util.List<String> sequence,
      Integer minCalls,
      Integer maxCalls) {
    if (requiresToolName(type) && !hasText(toolName)) {
      throw validation("Tool name is required for this expectation type", "TOOL_EXPECTATION_TOOL_REQUIRED");
    }
    if ((type == ToolExpectationType.AGENT_EQUALS || type == ToolExpectationType.AGENT_NOT_EQUALS)
        && !hasText(agentName)) {
      throw validation("Agent name is required for this expectation type", "TOOL_EXPECTATION_AGENT_REQUIRED");
    }
    if ((type == ToolExpectationType.TOOL_ARGS_MATCH || type == ToolExpectationType.AGENT_STEP_CONTAINS)
        && (argumentAssertions == null || argumentAssertions.isEmpty())) {
      throw validation(
          "Argument assertions are required for this expectation type",
          "TOOL_EXPECTATION_ARGUMENTS_REQUIRED");
    }
    if (type == ToolExpectationType.TOOL_SEQUENCE_MATCH && (sequence == null || sequence.isEmpty())) {
      throw validation("Sequence is required for TOOL_SEQUENCE_MATCH", "TOOL_EXPECTATION_SEQUENCE_REQUIRED");
    }
    if (type == ToolExpectationType.TOOL_CALL_COUNT && minCalls == null && maxCalls == null) {
      throw validation("Min calls or max calls is required for TOOL_CALL_COUNT", "TOOL_EXPECTATION_CALL_COUNT_REQUIRED");
    }
    if (minCalls != null && maxCalls != null && minCalls > maxCalls) {
      throw validation("Min calls must not exceed max calls", "TOOL_EXPECTATION_CALL_COUNT_INVALID");
    }
  }

  private boolean requiresToolName(ToolExpectationType type) {
    return type == ToolExpectationType.TOOL_MUST_BE_CALLED
        || type == ToolExpectationType.TOOL_MUST_NOT_BE_CALLED
        || type == ToolExpectationType.TOOL_ARGS_MATCH
        || type == ToolExpectationType.TOOL_CALL_COUNT
        || type == ToolExpectationType.TOOL_OUTPUT_USED_IN_ANSWER;
  }

  private void applyCreateDefaults(
      ToolExpectation toolExpectation, CreateToolExpectationRequest request) {
    if (request.targetSource() == null) {
      toolExpectation.setTargetSource(TargetSourceType.normalized_tool_calls);
    }
    if (request.threshold() == null) {
      toolExpectation.setThreshold(DEFAULT_THRESHOLD);
    }
    if (request.required() == null) {
      toolExpectation.setRequired(true);
    }
    if (request.severity() == null) {
      toolExpectation.setSeverity(SeverityLevel.MAJOR);
    }
    if (request.enabled() == null) {
      toolExpectation.setEnabled(true);
    }
    if (request.sortOrder() == null) {
      toolExpectation.setSortOrder(0);
    }
  }

  private void attachRubric(
      ToolExpectation toolExpectation, TestCase testCase, UUID rubricPublicId) {
    if (rubricPublicId == null) {
      return;
    }
    Rubric rubric = rubricRepository.findByPublicId(rubricPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.RUBRIC_NOT_FOUND));
    validateRubricVisibleToTestCase(rubric, testCase);
    toolExpectation.setRubric(rubric);
  }

  private void validateRubricVisibleToTestCase(Rubric rubric, TestCase testCase) {
    if (rubric.isArchived()) {
      throw new ResourceException(ErrorCode.RUBRIC_ARCHIVED);
    }
    Dataset dataset = testCase.getDataset();
    if (rubric.getScope() == RubricScope.GLOBAL) {
      return;
    }
    if (rubric.getProject() == null || !rubric.getProject().getId().equals(dataset.getProject().getId())) {
      throw validation("Rubric is not visible to this test case", "TOOL_EXPECTATION_RUBRIC_SCOPE_MISMATCH");
    }
    if (rubric.getScope() == RubricScope.DATASET
        && (rubric.getDataset() == null || !rubric.getDataset().getId().equals(dataset.getId()))) {
      throw validation("Dataset-scoped rubric is not visible to this test case", "TOOL_EXPECTATION_RUBRIC_SCOPE_MISMATCH");
    }
  }

  private ResourceException validation(String message, String code) {
    return new ResourceException(message, 422, code);
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}

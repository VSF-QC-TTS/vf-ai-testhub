package vn.vinfast.aitesthub.assertion.service.impl;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.assertion.mapper.AssertionMapper;
import vn.vinfast.aitesthub.assertion.repository.AssertionRepository;
import vn.vinfast.aitesthub.assertion.request.CreateAssertionRequest;
import vn.vinfast.aitesthub.assertion.request.UpdateAssertionRequest;
import vn.vinfast.aitesthub.assertion.response.AssertionResponse;
import vn.vinfast.aitesthub.assertion.service.AssertionService;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.rubric.repository.RubricRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssertionServiceImpl implements AssertionService {

  private static final BigDecimal DEFAULT_THRESHOLD = BigDecimal.valueOf(0.8);
  private static final EnumSet<AssertionType> TYPES_REQUIRING_EXPECTED_VALUE =
      EnumSet.of(
          AssertionType.contains,
          AssertionType.not_contains,
          AssertionType.equals,
          AssertionType.not_equals,
          AssertionType.regex,
          AssertionType.greater_than,
          AssertionType.less_than,
          AssertionType.between,
          AssertionType.array_length_greater_than,
          AssertionType.array_contains);

  private final AssertionRepository assertionRepository;
  private final TestCaseRepository testCaseRepository;
  private final RubricRepository rubricRepository;
  private final AssertionMapper assertionMapper;

  @Override
  @Transactional
  public AssertionResponse createAssertion(
      UUID testCasePublicId, CreateAssertionRequest request, String username) {
    TestCase testCase = getActiveTestCase(testCasePublicId);
    validateCreateRequest(request);

    Assertion assertion = assertionMapper.toEntity(request);
    assertion.setTestCase(testCase);
    applyCreateDefaults(assertion, request);
    attachRubric(assertion, testCase, request.rubricId());

    return assertionMapper.toResponse(assertionRepository.save(assertion));
  }

  @Override
  public Page<AssertionResponse> getAssertions(UUID testCasePublicId, Pageable pageable) {
    TestCase testCase = testCaseRepository.findByPublicId(testCasePublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));
    return assertionRepository.findByTestCase(testCase, pageable).map(assertionMapper::toResponse);
  }

  @Override
  public AssertionResponse getAssertion(UUID publicId) {
    return assertionRepository
        .findByPublicId(publicId)
        .map(assertionMapper::toResponse)
        .orElseThrow(() -> new ResourceException(ErrorCode.ASSERTION_NOT_FOUND));
  }

  @Override
  @Transactional
  public AssertionResponse updateAssertion(
      UUID publicId, UpdateAssertionRequest request, String username) {
    Assertion assertion = assertionRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.ASSERTION_NOT_FOUND));
    ensureActiveTestCase(assertion.getTestCase());

    AssertionScope nextScope = request.scope() == null ? assertion.getScope() : request.scope();
    AssertionType nextType = request.type() == null ? assertion.getType() : request.type();
    Object nextExpectedValue =
        request.expectedValue() == null ? assertion.getExpectedValue() : request.expectedValue();
    String nextRubricOverride =
        request.rubricOverride() == null ? assertion.getRubricOverride() : request.rubricOverride();
    UUID nextRubricId = request.rubricId();

    validateCombination(
        nextScope,
        nextType,
        request.targetComponent() == null ? assertion.getTargetComponent() : request.targetComponent(),
        request.fieldPath() == null ? assertion.getFieldPath() : request.fieldPath(),
        request.fieldPaths() == null ? assertion.getFieldPaths() : request.fieldPaths(),
        nextExpectedValue,
        nextRubricId,
        assertion.getRubric(),
        nextRubricOverride);

    assertionMapper.updateEntity(request, assertion);
    if (request.rubricId() != null) {
      attachRubric(assertion, assertion.getTestCase(), request.rubricId());
    }
    return assertionMapper.toResponse(assertion);
  }

  @Override
  @Transactional
  public void deleteAssertion(UUID publicId, String username) {
    Assertion assertion = assertionRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.ASSERTION_NOT_FOUND));
    ensureActiveTestCase(assertion.getTestCase());
    assertionRepository.delete(assertion);
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

  private void validateCreateRequest(CreateAssertionRequest request) {
    validateCombination(
        request.scope(),
        request.type(),
        request.targetComponent(),
        request.fieldPath(),
        request.fieldPaths(),
        request.expectedValue(),
        request.rubricId(),
        null,
        request.rubricOverride());
  }

  private void validateCombination(
      AssertionScope scope,
      AssertionType type,
      String targetComponent,
      String fieldPath,
      java.util.List<String> fieldPaths,
      Object expectedValue,
      UUID rubricId,
      Rubric currentRubric,
      String rubricOverride) {
    if (scope == AssertionScope.FIELD && !hasText(fieldPath)) {
      throw validation("Field path is required for FIELD assertions", "ASSERTION_FIELD_PATH_REQUIRED");
    }
    if (scope == AssertionScope.COMPONENT && !hasText(targetComponent)) {
      throw validation("Target component is required for COMPONENT assertions", "ASSERTION_COMPONENT_REQUIRED");
    }
    if (scope == AssertionScope.MULTI_FIELD
        && (fieldPaths == null || fieldPaths.isEmpty() || fieldPaths.stream().anyMatch(path -> !hasText(path)))) {
      throw validation("Field paths are required for MULTI_FIELD assertions", "ASSERTION_FIELD_PATHS_REQUIRED");
    }
    if (TYPES_REQUIRING_EXPECTED_VALUE.contains(type) && expectedValue == null) {
      throw validation("Expected value is required for this assertion type", "ASSERTION_EXPECTED_VALUE_REQUIRED");
    }
    if (type == AssertionType.llm_rubric
        && rubricId == null
        && currentRubric == null
        && !hasText(rubricOverride)) {
      throw validation("Rubric ID or rubric override is required for llm_rubric", "ASSERTION_RUBRIC_REQUIRED");
    }
  }

  private void applyCreateDefaults(Assertion assertion, CreateAssertionRequest request) {
    if (request.threshold() == null) {
      assertion.setThreshold(DEFAULT_THRESHOLD);
    }
    if (request.weight() == null) {
      assertion.setWeight(BigDecimal.ONE);
    }
    if (request.severity() == null) {
      assertion.setSeverity(SeverityLevel.MAJOR);
    }
    if (request.enabled() == null) {
      assertion.setEnabled(true);
    }
    if (request.sortOrder() == null) {
      assertion.setSortOrder(0);
    }
  }

  private void attachRubric(Assertion assertion, TestCase testCase, UUID rubricPublicId) {
    if (rubricPublicId == null) {
      return;
    }
    Rubric rubric = rubricRepository.findByPublicId(rubricPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.RUBRIC_NOT_FOUND));
    validateRubricVisibleToTestCase(rubric, testCase);
    assertion.setRubric(rubric);
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
      throw validation("Rubric is not visible to this test case", "ASSERTION_RUBRIC_SCOPE_MISMATCH");
    }
    if (rubric.getScope() == RubricScope.DATASET
        && (rubric.getDataset() == null || !rubric.getDataset().getId().equals(dataset.getId()))) {
      throw validation("Dataset-scoped rubric is not visible to this test case", "ASSERTION_RUBRIC_SCOPE_MISMATCH");
    }
  }

  private ResourceException validation(String message, String code) {
    return new ResourceException(message, 422, code);
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}

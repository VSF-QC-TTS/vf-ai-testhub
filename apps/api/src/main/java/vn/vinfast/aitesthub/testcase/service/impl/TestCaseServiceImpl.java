package vn.vinfast.aitesthub.testcase.service.impl;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;
import vn.vinfast.aitesthub.testcase.mapper.TestCaseMapper;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.testcase.request.CreateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.request.TestCaseFilter;
import vn.vinfast.aitesthub.testcase.request.UpdateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.response.TestCaseResponse;
import vn.vinfast.aitesthub.testcase.service.TestCaseService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TestCaseServiceImpl implements TestCaseService {

  private final TestCaseRepository testCaseRepository;
  private final DatasetRepository datasetRepository;
  private final TestCaseMapper testCaseMapper;

  @Override
  @Transactional
  public TestCaseResponse createTestCase(
      UUID datasetPublicId, CreateTestCaseRequest request, String username) {
    Dataset dataset = getActiveDataset(datasetPublicId);

    TestCase testCase = testCaseMapper.toEntity(request);
    testCase.setDataset(dataset);
    applyCreateDefaults(testCase, request);

    return testCaseMapper.toResponse(testCaseRepository.save(testCase));
  }

  @Override
  public TestCaseResponse getTestCase(UUID publicId) {
    return testCaseRepository
        .findByPublicId(publicId)
        .map(testCaseMapper::toResponse)
        .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));
  }

  @Override
  public Page<TestCaseResponse> getTestCases(
      UUID datasetPublicId, TestCaseFilter filter, Pageable pageable) {
    Dataset dataset =
        datasetRepository
            .findByPublicId(datasetPublicId)
            .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));

    return testCaseRepository.findAll(toSpecification(dataset, filter), pageable).map(testCaseMapper::toResponse);
  }

  @Override
  @Transactional
  public TestCaseResponse updateTestCase(
      UUID publicId, UpdateTestCaseRequest request, String username) {
    TestCase testCase =
        testCaseRepository
            .findByPublicId(publicId)
            .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));

    if (testCase.getDataset().isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
    if (request.input() != null && request.input().isBlank()) {
      throw new ResourceException("Input must not be blank", ErrorCode.VALIDATION_ERROR.getStatus(), "VALIDATION_ERROR");
    }

    testCaseMapper.updateEntity(request, testCase);
    return testCaseMapper.toResponse(testCase);
  }

  @Override
  @Transactional
  public void deleteTestCase(UUID publicId, String username) {
    TestCase testCase =
        testCaseRepository
            .findByPublicId(publicId)
            .orElseThrow(() -> new ResourceException(ErrorCode.TEST_CASE_NOT_FOUND));

    if (testCase.getDataset().isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }

    testCaseRepository.delete(testCase);
  }

  private Dataset getActiveDataset(UUID datasetPublicId) {
    Dataset dataset =
        datasetRepository
            .findByPublicId(datasetPublicId)
            .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
    if (dataset.isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
    return dataset;
  }

  private void applyCreateDefaults(TestCase testCase, CreateTestCaseRequest request) {
    if (request.priority() == null) {
      testCase.setPriority(TestPriority.P2);
    }
    if (request.enabled() == null) {
      testCase.setEnabled(true);
    }
    if (request.sortOrder() == null) {
      testCase.setSortOrder(0);
    }
    testCase.setSource(TestCaseSource.MANUAL);
  }

  private Specification<TestCase> toSpecification(Dataset dataset, TestCaseFilter filter) {
    return (root, query, criteriaBuilder) -> {
      var predicates = new ArrayList<Predicate>();
      predicates.add(criteriaBuilder.equal(root.get("dataset"), dataset));

      if (filter == null) {
        return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
      }
      if (hasText(filter.sectionName())) {
        predicates.add(criteriaBuilder.equal(root.get("sectionName"), filter.sectionName()));
      }
      if (filter.priority() != null) {
        predicates.add(criteriaBuilder.equal(root.get("priority"), filter.priority()));
      }
      if (filter.enabled() != null) {
        predicates.add(criteriaBuilder.equal(root.get("enabled"), filter.enabled()));
      }
      if (filter.source() != null) {
        predicates.add(criteriaBuilder.equal(root.get("source"), filter.source()));
      }
      if (hasText(filter.tag())) {
        String tagNeedle = "%\"" + filter.tag().toLowerCase(Locale.ROOT) + "\"%";
        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("tags").as(String.class)), tagNeedle));
      }
      if (hasText(filter.search())) {
        String keyword = "%" + filter.search().toLowerCase(Locale.ROOT) + "%";
        predicates.add(
            criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), keyword),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("input")), keyword),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("expectedBehavior")), keyword)));
      }

      return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
    };
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}

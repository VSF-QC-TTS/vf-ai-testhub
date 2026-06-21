package vn.vinfast.aitesthub.testcase.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.testcase.request.CreateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.request.TestCaseFilter;
import vn.vinfast.aitesthub.testcase.request.UpdateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.response.TestCaseResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Validated
public interface TestCaseService {

  /**
   * Creates a test case inside a dataset.
   *
   * @param datasetPublicId the public ID of the owning {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @param request the validated {@link CreateTestCaseRequest}
   * @param username the username of the authenticated user creating the test case
   * @return the created {@link TestCaseResponse}
   */
  TestCaseResponse createTestCase(
      UUID datasetPublicId, @Valid CreateTestCaseRequest request, String username);

  /**
   * Retrieves a test case by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @return the matching {@link TestCaseResponse}
   */
  TestCaseResponse getTestCase(UUID publicId);

  /**
   * Retrieves test cases for a dataset using pagination and optional filters.
   *
   * @param datasetPublicId the public ID of the owning {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @param filter optional listing filters
   * @param pageable pagination information
   * @return a paginated {@link TestCaseResponse}
   */
  Page<TestCaseResponse> getTestCases(
      UUID datasetPublicId, TestCaseFilter filter, Pageable pageable);

  /**
   * Updates a test case by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @param request the validated {@link UpdateTestCaseRequest}
   * @param username the username of the authenticated user updating the test case
   * @return the updated {@link TestCaseResponse}
   */
  TestCaseResponse updateTestCase(
      UUID publicId, @Valid UpdateTestCaseRequest request, String username);

  /**
   * Deletes a test case by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @param username the username of the authenticated user deleting the test case
   */
  void deleteTestCase(UUID publicId, String username);
}

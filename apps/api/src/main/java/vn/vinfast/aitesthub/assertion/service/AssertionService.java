package vn.vinfast.aitesthub.assertion.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.assertion.request.CreateAssertionRequest;
import vn.vinfast.aitesthub.assertion.request.UpdateAssertionRequest;
import vn.vinfast.aitesthub.assertion.response.AssertionResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Validated
public interface AssertionService {

  /**
   * Creates an assertion inside a test case.
   *
   * @param testCasePublicId the public ID of the owning {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @param request the validated {@link CreateAssertionRequest}
   * @param username the username of the authenticated user creating the assertion
   * @return the created {@link AssertionResponse}
   */
  AssertionResponse createAssertion(
      UUID testCasePublicId, @Valid CreateAssertionRequest request, String username);

  /**
   * Retrieves assertions for a test case.
   *
   * @param testCasePublicId the public ID of the owning {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @param pageable pagination information
   * @return a paginated {@link AssertionResponse}
   */
  Page<AssertionResponse> getAssertions(UUID testCasePublicId, Pageable pageable);

  /**
   * Retrieves an assertion by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.assertion.entity.Assertion}
   * @return the matching {@link AssertionResponse}
   */
  AssertionResponse getAssertion(UUID publicId);

  /**
   * Updates an assertion by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.assertion.entity.Assertion}
   * @param request the validated {@link UpdateAssertionRequest}
   * @param username the username of the authenticated user updating the assertion
   * @return the updated {@link AssertionResponse}
   */
  AssertionResponse updateAssertion(
      UUID publicId, @Valid UpdateAssertionRequest request, String username);

  /**
   * Deletes an assertion by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.assertion.entity.Assertion}
   * @param username the username of the authenticated user deleting the assertion
   */
  void deleteAssertion(UUID publicId, String username);
}

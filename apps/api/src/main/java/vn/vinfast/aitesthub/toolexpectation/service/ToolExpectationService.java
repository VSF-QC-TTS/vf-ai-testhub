package vn.vinfast.aitesthub.toolexpectation.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.toolexpectation.request.CreateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.request.UpdateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.response.ToolExpectationResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Validated
public interface ToolExpectationService {

  /**
   * Creates a tool expectation inside a test case.
   *
   * @param testCasePublicId the public ID of the owning {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @param request the validated {@link CreateToolExpectationRequest}
   * @param username the username of the authenticated user creating the tool expectation
   * @return the created {@link ToolExpectationResponse}
   */
  ToolExpectationResponse createToolExpectation(
      UUID testCasePublicId, @Valid CreateToolExpectationRequest request, String username);

  /**
   * Retrieves tool expectations for a test case.
   *
   * @param testCasePublicId the public ID of the owning {@link vn.vinfast.aitesthub.testcase.entity.TestCase}
   * @param pageable pagination information
   * @return a paginated {@link ToolExpectationResponse}
   */
  Page<ToolExpectationResponse> getToolExpectations(UUID testCasePublicId, Pageable pageable);

  /**
   * Retrieves a tool expectation by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation}
   * @return the matching {@link ToolExpectationResponse}
   */
  ToolExpectationResponse getToolExpectation(UUID publicId);

  /**
   * Updates a tool expectation by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation}
   * @param request the validated {@link UpdateToolExpectationRequest}
   * @param username the username of the authenticated user updating the tool expectation
   * @return the updated {@link ToolExpectationResponse}
   */
  ToolExpectationResponse updateToolExpectation(
      UUID publicId, @Valid UpdateToolExpectationRequest request, String username);

  /**
   * Deletes a tool expectation by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation}
   * @param username the username of the authenticated user deleting the tool expectation
   */
  void deleteToolExpectation(UUID publicId, String username);
}

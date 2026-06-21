package vn.vinfast.aitesthub.result.service;

import java.util.UUID;
import vn.vinfast.aitesthub.result.request.ManualReviewRequest;
import vn.vinfast.aitesthub.result.response.ManualReviewResponse;

/**
 * Handles QC manual overrides for automated test results.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public interface ManualReviewService {

  /**
   * Creates or updates the manual review decision for a test result.
   *
   * @param testResultId public UUID of the test result being reviewed
   * @param request reviewed status and reviewer note
   * @param reviewerUsername authenticated reviewer username/email
   * @return persisted manual review state after applying the override
   */
  ManualReviewResponse reviewResult(
      UUID testResultId, ManualReviewRequest request, String reviewerUsername);
}

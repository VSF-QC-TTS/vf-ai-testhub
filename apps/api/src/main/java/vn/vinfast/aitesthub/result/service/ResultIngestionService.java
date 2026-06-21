package vn.vinfast.aitesthub.result.service;

import java.util.UUID;
import vn.vinfast.aitesthub.result.request.ResultIngestionRequest;

/**
 * Handles runner-to-backend result callbacks.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public interface ResultIngestionService {

  /**
   * Persists a batched result callback for an evaluation run and completes the run when requested.
   *
   * @param runId public UUID of the run receiving results
   * @param request batch payload containing test, assertion, and tool expectation results
   */
  void ingestRunResults(UUID runId, ResultIngestionRequest request);
}

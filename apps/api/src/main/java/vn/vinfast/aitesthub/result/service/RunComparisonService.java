package vn.vinfast.aitesthub.result.service;

import java.util.UUID;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public interface RunComparisonService {

  /**
   * Compares two completed evaluation runs on the same dataset and selected scope.
   *
   * @param baseRunId public UUID of the baseline run
   * @param candidateRunId public UUID of the candidate run
   * @return comparison summary and testcase-level diffs
   */
  RunComparisonResponse compareRuns(UUID baseRunId, UUID candidateRunId);
}

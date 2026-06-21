package vn.vinfast.aitesthub.result.service;

import java.util.UUID;
import vn.vinfast.aitesthub.result.response.RunReportResponse;

/**
 * Aggregates evaluation run results for reporting screens.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public interface ReportService {

  /**
   * Builds a report for a run using final statuses after manual review overrides.
   *
   * @param runId public UUID of the run to aggregate
   * @return report summary and per-test breakdown for the run
   */
  RunReportResponse getRunReport(UUID runId);
}

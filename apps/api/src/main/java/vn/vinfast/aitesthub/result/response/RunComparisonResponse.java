package vn.vinfast.aitesthub.result.response;

import java.util.List;
import lombok.Builder;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record RunComparisonResponse(
    RunComparisonRunSummary baseRun,
    RunComparisonRunSummary candidateRun,
    RunComparisonSummary summary,
    List<TestCaseComparisonDiff> diffs) {}

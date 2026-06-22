package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record TestCaseComparisonDiff(
    UUID testCasePublicId,
    String externalId,
    String testCaseName,
    String testCaseInput,
    String sectionName,
    ReviewStatus baseStatus,
    ReviewStatus candidateStatus,
    RunComparisonStatusShift statusShift,
    BigDecimal baseScore,
    BigDecimal candidateScore,
    Integer baseLatencyMs,
    Integer candidateLatencyMs,
    Integer latencyDeltaMs,
    String baseErrorMessage,
    String candidateErrorMessage,
    List<AssertionComparisonDiff> assertionDiffs,
    List<ToolExpectationComparisonDiff> toolExpectationDiffs) {}

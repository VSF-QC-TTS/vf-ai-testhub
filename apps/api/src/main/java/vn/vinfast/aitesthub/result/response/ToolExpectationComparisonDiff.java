package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record ToolExpectationComparisonDiff(
    UUID toolExpectationPublicId,
    String expectedToolName,
    ReviewStatus baseStatus,
    ReviewStatus candidateStatus,
    RunComparisonStatusShift statusShift,
    Object baseActualToolCalls,
    Object candidateActualToolCalls,
    BigDecimal baseScore,
    BigDecimal candidateScore) {}

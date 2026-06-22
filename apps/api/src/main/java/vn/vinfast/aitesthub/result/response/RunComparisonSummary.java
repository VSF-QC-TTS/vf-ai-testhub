package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import lombok.Builder;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record RunComparisonSummary(
    Integer totalComparableCases,
    Integer regressions,
    Integer fixes,
    Integer unchanged,
    Integer statusChanged,
    Integer newCases,
    Integer missingCases,
    BigDecimal basePassRate,
    BigDecimal candidatePassRate,
    BigDecimal passRateDelta,
    Integer averageLatencyDeltaMs) {}

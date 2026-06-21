package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record RunReportResponse(
    UUID runPublicId,
    int total,
    int passed,
    int failed,
    int error,
    int skipped,
    int uncertain,
    BigDecimal passRate,
    List<TestResultReportItem> results) {}

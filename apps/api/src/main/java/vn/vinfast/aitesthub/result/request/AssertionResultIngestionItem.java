package vn.vinfast.aitesthub.result.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record AssertionResultIngestionItem(
    @NotNull UUID assertionId,
    @NotNull ReviewStatus status,
    Object actualValue,
    Object expectedValue,
    String reason,
    BigDecimal score,
    SeverityLevel severity,
    Map<String, Object> metadata) {}

package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
public record AssertionResultResponse(
    UUID publicId,
    UUID testResultPublicId,
    UUID assertionPublicId,
    ReviewStatus status,
    Object actualValue,
    Object expectedValue,
    String reason,
    BigDecimal score,
    SeverityLevel severity,
    Map<String, Object> metadata,
    OffsetDateTime createdAt
) {}

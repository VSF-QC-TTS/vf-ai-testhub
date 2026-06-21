package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
public record ToolExpectationResultResponse(
    UUID publicId,
    UUID testResultPublicId,
    UUID toolExpectationPublicId,
    ReviewStatus status,
    String expectedToolName,
    Object actualToolCalls,
    String actualAgent,
    Object actualSteps,
    String reason,
    BigDecimal score,
    Map<String, Object> metadata,
    OffsetDateTime createdAt
) {}

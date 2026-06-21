package vn.vinfast.aitesthub.result.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record ToolExpectationResultIngestionItem(
    @NotNull UUID toolExpectationId,
    @NotNull ReviewStatus status,
    String expectedToolName,
    Object actualToolCalls,
    String actualAgent,
    Object actualSteps,
    String reason,
    BigDecimal score,
    Map<String, Object> metadata) {}

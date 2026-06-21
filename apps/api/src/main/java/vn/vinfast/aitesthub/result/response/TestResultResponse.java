package vn.vinfast.aitesthub.result.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
public record TestResultResponse(
    UUID publicId,
    UUID runPublicId,
    UUID testCasePublicId,
    ReviewStatus status,
    BigDecimal score,
    Map<String, Object> requestSnapshot,
    Map<String, Object> rawResponse,
    Map<String, Object> responseSnapshot,
    Map<String, Object> extractedComponents,
    Object extractedToolCalls,
    Integer latencyMs,
    String errorMessage,
    List<AssertionResultResponse> assertionResults,
    List<ToolExpectationResultResponse> toolExpectationResults,
    OffsetDateTime createdAt
) {}

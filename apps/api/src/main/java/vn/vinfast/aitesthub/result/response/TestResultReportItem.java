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
 * @since 6/22/2026
 */
@Builder
public record TestResultReportItem(
    UUID publicId,
    UUID testCasePublicId,
    String testCaseName,
    String testCaseInput,
    String sectionName,
    ReviewStatus autoStatus,
    ReviewStatus finalStatus,
    BigDecimal score,
    Map<String, Object> requestSnapshot,
    Map<String, Object> rawResponse,
    Map<String, Object> responseSnapshot,
    Map<String, Object> extractedComponents,
    Object extractedToolCalls,
    Integer latencyMs,
    String errorMessage,
    ManualReviewResponse manualReview,
    List<AssertionResultResponse> assertionResults,
    List<ToolExpectationResultResponse> toolExpectationResults,
    OffsetDateTime createdAt) {}

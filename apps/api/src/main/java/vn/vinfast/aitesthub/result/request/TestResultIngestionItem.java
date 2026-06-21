package vn.vinfast.aitesthub.result.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record TestResultIngestionItem(
    @NotNull UUID testCaseId,
    @NotNull ReviewStatus status,
    BigDecimal score,
    Map<String, Object> requestSnapshot,
    Map<String, Object> rawResponse,
    Map<String, Object> responseSnapshot,
    Map<String, Object> extractedComponents,
    Object extractedToolCalls,
    Integer latencyMs,
    String errorMessage,
    List<@Valid AssertionResultIngestionItem> assertionResults,
    List<@Valid ToolExpectationResultIngestionItem> toolExpectationResults) {}

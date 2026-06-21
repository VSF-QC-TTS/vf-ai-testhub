package vn.vinfast.aitesthub.run.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
@Schema(description = "Response object representing a run")
public record RunResponse(
    UUID publicId,
    UUID projectPublicId,
    UUID datasetPublicId,
    UUID targetPublicId,
    RunStatus status,
    RunMode runMode,
    boolean includeLlmJudge,
    boolean includeToolExpectations,
    Integer maxConcurrency,
    Integer timeoutMs,
    Integer retryCount,
    UUID triggeredByPublicId,
    UUID previousRunPublicId,
    List<UUID> selectedCaseIds,
    String selectedSection,
    OffsetDateTime startedAt,
    OffsetDateTime finishedAt,
    Integer totalTestCases,
    Integer completedTestCases,
    Integer passedCount,
    Integer failedCount,
    Integer errorCount,
    Integer skippedCount,
    Integer llmRubricCount,
    Integer estimatedLlmCalls,
    String failureReason,
    Map<String, Object> summary,
    Map<String, Object> configSnapshot,
    String artifactPath,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}

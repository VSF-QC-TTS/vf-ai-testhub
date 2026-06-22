package vn.vinfast.aitesthub.result.response;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.run.enums.RunStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record RunComparisonRunSummary(
    UUID publicId,
    UUID datasetPublicId,
    String datasetName,
    UUID targetPublicId,
    String targetName,
    RunStatus status,
    Integer totalTestCases,
    Integer completedTestCases,
    Integer passedCount,
    Integer failedCount,
    Integer errorCount,
    Integer skippedCount,
    OffsetDateTime startedAt,
    OffsetDateTime finishedAt) {}

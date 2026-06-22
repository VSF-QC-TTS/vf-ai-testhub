package vn.vinfast.aitesthub.experiment.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.experiment.enums.ExperimentStatus;
import vn.vinfast.aitesthub.run.enums.RunMode;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record ExperimentResponse(
    UUID publicId,
    UUID projectPublicId,
    UUID datasetPublicId,
    String name,
    String description,
    RunMode runMode,
    List<UUID> selectedCaseIds,
    String selectedSection,
    boolean includeLlmJudge,
    boolean includeToolExpectations,
    Integer maxConcurrency,
    Integer timeoutMs,
    Integer retryCount,
    ExperimentStatus status,
    UUID createdByPublicId,
    OffsetDateTime startedAt,
    OffsetDateTime finishedAt,
    List<ExperimentVariantResponse> variants,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {}

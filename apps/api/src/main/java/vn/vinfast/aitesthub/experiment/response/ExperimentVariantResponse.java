package vn.vinfast.aitesthub.experiment.response;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.run.enums.RunStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record ExperimentVariantResponse(
    UUID publicId,
    String variantKey,
    String name,
    UUID targetPublicId,
    String targetName,
    UUID runPublicId,
    RunStatus runStatus,
    Map<String, Object> runtimeOptions,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {}

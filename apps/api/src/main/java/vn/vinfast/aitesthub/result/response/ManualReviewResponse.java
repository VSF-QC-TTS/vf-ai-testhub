package vn.vinfast.aitesthub.result.response;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record ManualReviewResponse(
    UUID publicId,
    UUID testResultPublicId,
    ReviewStatus autoStatus,
    String autoReason,
    ReviewStatus reviewedStatus,
    String reviewerNote,
    UUID reviewedByPublicId,
    OffsetDateTime reviewedAt,
    ReviewStatus finalStatus,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {}

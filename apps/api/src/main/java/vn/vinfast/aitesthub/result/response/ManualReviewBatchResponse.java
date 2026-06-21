package vn.vinfast.aitesthub.result.response;

import java.util.List;
import java.util.UUID;
import lombok.Builder;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record ManualReviewBatchResponse(
    UUID runPublicId, int reviewedCount, List<ManualReviewResponse> reviews) {}

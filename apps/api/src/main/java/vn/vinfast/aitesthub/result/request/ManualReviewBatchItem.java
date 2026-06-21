package vn.vinfast.aitesthub.result.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record ManualReviewBatchItem(
    @NotNull UUID testResultId, @NotNull ReviewStatus reviewedStatus, String reviewerNote) {}

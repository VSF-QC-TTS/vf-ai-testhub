package vn.vinfast.aitesthub.result.request;

import jakarta.validation.constraints.NotNull;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record ManualReviewRequest(@NotNull ReviewStatus reviewedStatus, String reviewerNote) {}

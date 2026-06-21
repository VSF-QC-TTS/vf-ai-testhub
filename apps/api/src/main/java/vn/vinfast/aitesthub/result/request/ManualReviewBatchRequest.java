package vn.vinfast.aitesthub.result.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record ManualReviewBatchRequest(
    @NotEmpty List<@Valid ManualReviewBatchItem> reviews) {}

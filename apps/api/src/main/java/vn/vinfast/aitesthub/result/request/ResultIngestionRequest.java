package vn.vinfast.aitesthub.result.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record ResultIngestionRequest(
    @NotNull Boolean finalBatch, @NotNull List<@Valid TestResultIngestionItem> testResults) {}

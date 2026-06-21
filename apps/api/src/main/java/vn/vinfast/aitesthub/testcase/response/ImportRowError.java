package vn.vinfast.aitesthub.testcase.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Row-level import error")
public record ImportRowError(
    @Schema(description = "One-based row number from the imported file", example = "42") int row,
    @Schema(description = "Reason this row failed or was skipped", example = "Missing required input") String reason
) {}

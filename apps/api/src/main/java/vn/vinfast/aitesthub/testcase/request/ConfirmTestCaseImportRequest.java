package vn.vinfast.aitesthub.testcase.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Request object for confirming a test case import preview")
public record ConfirmTestCaseImportRequest(
    @Schema(description = "Public UUID of the import preview", example = "550e8400-e29b-41d4-a716-446655440000")
    @NotNull(message = "Preview ID is required")
    UUID previewId,

    @Schema(description = "Column-to-field mapping override", nullable = true)
    Map<String, String> columnMapping,

    @Schema(description = "Whether duplicate external IDs should be skipped", example = "true", nullable = true)
    Boolean skipDuplicates,

    @Schema(description = "Default tags applied to imported test cases", example = "[\"imported\", \"legacy\"]", nullable = true)
    List<String> defaultTags
) {}

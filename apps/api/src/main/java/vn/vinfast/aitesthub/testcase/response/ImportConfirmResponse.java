package vn.vinfast.aitesthub.testcase.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Response object for a confirmed test case import")
public record ImportConfirmResponse(
    @Schema(description = "Public UUID of the import preview that was confirmed")
    UUID previewId,

    @Schema(description = "Public UUID of the imported dataset")
    UUID datasetPublicId,

    @Schema(description = "Total data rows processed", example = "200")
    int totalRows,

    @Schema(description = "Rows imported successfully", example = "195")
    int importedCount,

    @Schema(description = "Rows skipped during import", example = "3")
    int skippedCount,

    @Schema(description = "Rows that failed validation", example = "2")
    int errorCount,

    @Schema(description = "Row-level import errors")
    List<ImportRowError> errors,

    @Schema(description = "When the import was confirmed")
    OffsetDateTime createdAt
) {}

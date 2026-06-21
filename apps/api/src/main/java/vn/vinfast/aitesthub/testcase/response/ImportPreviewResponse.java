package vn.vinfast.aitesthub.testcase.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Response object for a test case import preview")
public record ImportPreviewResponse(
    @Schema(description = "Public UUID of the import preview")
    UUID previewId,

    @Schema(description = "Original uploaded file name")
    String fileName,

    @Schema(description = "Total data rows detected in the file", example = "200")
    int totalRows,

    @Schema(description = "Columns detected from the file header")
    List<String> detectedColumns,

    @Schema(description = "Suggested source-column to domain-field mapping")
    Map<String, String> suggestedMapping,

    @Schema(description = "Sample rows for QC preview")
    List<ImportSampleRow> sampleRows,

    @Schema(description = "Number of duplicate external IDs detected", example = "3")
    int duplicateCount,

    @Schema(description = "Duplicate external IDs detected in the target dataset")
    List<String> duplicateExternalIds,

    @Schema(description = "Preview expiration timestamp")
    OffsetDateTime expiresAt
) {}

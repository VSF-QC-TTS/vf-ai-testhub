package vn.vinfast.aitesthub.testcase.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Sample row returned by import preview")
public record ImportSampleRow(
    @Schema(description = "One-based row number from the imported file", example = "1") int row,
    @Schema(description = "Raw row data keyed by detected column")
    Map<String, Object> data
) {}

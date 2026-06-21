package vn.vinfast.aitesthub.rubric.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Map;
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Request object for updating a rubric")
public record UpdateRubricRequest(
    @Schema(description = "Rubric name", example = "Answer Quality Vietnamese", nullable = true)
    @Size(max = 255, message = "Name must not exceed 255 characters")
    String name,

    @Schema(description = "Rubric description", nullable = true)
    String description,

    @Schema(description = "Rubric category", example = "ANSWER_QUALITY", nullable = true)
    RubricCategory category,

    @Schema(description = "Rubric language", example = "vi", nullable = true)
    @Size(max = 10, message = "Language must not exceed 10 characters")
    String language,

    @Schema(description = "Pass/fail criteria used by the LLM judge", nullable = true)
    String content,

    @Schema(description = "Default pass threshold", example = "0.8", nullable = true)
    @DecimalMin(value = "0.0", message = "Default threshold must be at least 0")
    @DecimalMax(value = "1.0", message = "Default threshold must not exceed 1")
    BigDecimal defaultThreshold,

    @Schema(description = "Additional key-value metadata", nullable = true)
    Map<String, Object> metadata,

    @Schema(description = "Whether this rubric is archived", example = "false", nullable = true)
    Boolean archived
) {}

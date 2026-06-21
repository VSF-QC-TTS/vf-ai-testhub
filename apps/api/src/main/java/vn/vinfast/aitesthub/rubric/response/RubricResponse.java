package vn.vinfast.aitesthub.rubric.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
@Schema(description = "Response object representing a rubric")
public record RubricResponse(
    @Schema(description = "The public UUID of the rubric")
    UUID publicId,

    @Schema(description = "Rubric scope", example = "PROJECT")
    RubricScope scope,

    @Schema(description = "The public UUID of the owning project")
    UUID projectPublicId,

    @Schema(description = "The public UUID of the scoped dataset")
    UUID datasetPublicId,

    @Schema(description = "Rubric name", example = "Answer Quality Vietnamese")
    String name,

    @Schema(description = "Rubric description")
    String description,

    @Schema(description = "Rubric category", example = "ANSWER_QUALITY")
    RubricCategory category,

    @Schema(description = "Rubric language", example = "vi")
    String language,

    @Schema(description = "Pass/fail criteria used by the LLM judge")
    String content,

    @Schema(description = "Default pass threshold", example = "0.8000")
    BigDecimal defaultThreshold,

    @Schema(description = "Additional key-value metadata")
    Map<String, Object> metadata,

    @Schema(description = "The public UUID of the creator")
    UUID createdByPublicId,

    @Schema(description = "Whether this rubric is archived")
    boolean archived,

    @Schema(description = "When the rubric was created")
    OffsetDateTime createdAt,

    @Schema(description = "When the rubric was last updated")
    OffsetDateTime updatedAt
) {}

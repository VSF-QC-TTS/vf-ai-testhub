package vn.vinfast.aitesthub.dataset.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@Builder
@Schema(description = "Response object representing a dataset")
public record DatasetResponse(
    @Schema(description = "The public UUID of the dataset", example = "550e8400-e29b-41d4-a716-446655440000")
    UUID publicId,

    @Schema(description = "The public UUID of the project this dataset belongs to", example = "660e8400-e29b-41d4-a716-446655440000")
    UUID projectPublicId,

    @Schema(description = "The name of the dataset", example = "Core Authentication Flows")
    String name,

    @Schema(description = "A description of the dataset's purpose", example = "Tests covering login, registration, and password reset")
    String description,

    @Schema(description = "A category to organize datasets", example = "Regression")
    String category,

    @Schema(description = "Tags associated with the dataset", example = "[\"auth\", \"p1\"]")
    List<String> tags,

    @Schema(description = "Additional key-value metadata", example = "{\"source\": \"jira\"}")
    Map<String, Object> metadata,

    @Schema(description = "Whether the dataset is archived", example = "false")
    boolean archived,

    @Schema(description = "When the dataset was created")
    OffsetDateTime createdAt,

    @Schema(description = "When the dataset was last updated")
    OffsetDateTime updatedAt
) {}

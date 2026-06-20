package vn.vinfast.aitesthub.dataset.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@Schema(description = "Request object for creating a new dataset")
public record CreateDatasetRequest(
    @Schema(description = "The name of the dataset", example = "Core Authentication Flows")
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    String name,

    @Schema(description = "A description of the dataset's purpose", example = "Tests covering login, registration, and password reset", nullable = true)
    String description,

    @Schema(description = "A category to organize datasets", example = "Regression", nullable = true)
    @Size(max = 100, message = "Category must not exceed 100 characters")
    String category,

    @Schema(description = "Tags associated with the dataset", example = "[\"auth\", \"p1\"]", nullable = true)
    List<String> tags,

    @Schema(description = "Additional key-value metadata", example = "{\"source\": \"jira\"}", nullable = true)
    Map<String, Object> metadata
) {}

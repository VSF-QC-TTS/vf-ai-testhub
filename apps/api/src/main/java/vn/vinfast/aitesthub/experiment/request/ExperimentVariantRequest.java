package vn.vinfast.aitesthub.experiment.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Map;
import java.util.UUID;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Schema(description = "Experiment variant configuration")
public record ExperimentVariantRequest(
    @Schema(description = "Stable variant key", example = "A")
    @NotBlank(message = "Variant key is required")
    @Size(max = 50, message = "Variant key must not exceed 50 characters")
    String variantKey,

    @Schema(description = "Variant display name", example = "Baseline")
    @NotBlank(message = "Variant name is required")
    @Size(max = 255, message = "Variant name must not exceed 255 characters")
    String name,

    @Schema(description = "Target public UUID used by this variant")
    @NotNull(message = "Target ID is required")
    UUID targetId,

    @Schema(description = "Optional variant runtime metadata", nullable = true)
    Map<String, Object> runtimeOptions) {}

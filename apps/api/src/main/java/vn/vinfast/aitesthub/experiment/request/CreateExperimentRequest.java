package vn.vinfast.aitesthub.experiment.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import vn.vinfast.aitesthub.run.enums.RunMode;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Schema(description = "Request object for creating an experiment draft")
public record CreateExperimentRequest(
    @Schema(description = "Dataset public UUID")
    @NotNull(message = "Dataset ID is required")
    UUID datasetId,

    @Schema(description = "Experiment name", example = "Prompt v3.1 vs v3.2")
    @NotBlank(message = "Experiment name is required")
    @Size(max = 255, message = "Experiment name must not exceed 255 characters")
    String name,

    @Schema(description = "Experiment description", nullable = true)
    @Size(max = 5000, message = "Experiment description must not exceed 5000 characters")
    String description,

    @Schema(description = "Run mode", example = "FULL_DATASET", nullable = true)
    RunMode runMode,

    @Schema(description = "Selected test case public UUIDs", nullable = true)
    List<UUID> selectedCaseIds,

    @Schema(description = "Selected section name", nullable = true)
    @Size(max = 500, message = "Selected section must not exceed 500 characters")
    String selectedSection,

    @Schema(description = "Whether to include LLM judge assertions", nullable = true)
    Boolean includeLlmJudge,

    @Schema(description = "Whether to include tool expectations", nullable = true)
    Boolean includeToolExpectations,

    @Schema(description = "Maximum concurrent test executions", nullable = true)
    @Min(value = 1, message = "Max concurrency must be at least 1")
    @Max(value = 50, message = "Max concurrency must not exceed 50")
    Integer maxConcurrency,

    @Schema(description = "Per-test timeout in milliseconds", nullable = true)
    @Min(value = 1000, message = "Timeout must be at least 1000 ms")
    @Max(value = 300000, message = "Timeout must not exceed 300000 ms")
    Integer timeoutMs,

    @Schema(description = "Retry count for failed target calls", nullable = true)
    @Min(value = 0, message = "Retry count must be at least 0")
    @Max(value = 5, message = "Retry count must not exceed 5")
    Integer retryCount,

    @Schema(description = "Experiment variants")
    @NotNull(message = "Experiment variants are required")
    @Size(min = 2, max = 8, message = "Experiment must have between 2 and 8 variants")
    List<@Valid ExperimentVariantRequest> variants) {}

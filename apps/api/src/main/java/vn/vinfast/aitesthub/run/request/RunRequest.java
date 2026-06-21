package vn.vinfast.aitesthub.run.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import vn.vinfast.aitesthub.run.enums.RunMode;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Request object for triggering a dataset run")
public record RunRequest(
    @Schema(description = "Target public UUID to run against")
    @NotNull(message = "Target ID is required")
    UUID targetId,

    @Schema(description = "Run mode", example = "FULL_DATASET", nullable = true)
    RunMode runMode,

    @Schema(description = "Selected test case public UUIDs", nullable = true)
    List<UUID> selectedCaseIds,

    @Schema(description = "Selected section name", nullable = true)
    @Size(max = 500, message = "Selected section must not exceed 500 characters")
    String selectedSection,

    @Schema(description = "Previous run public UUID for reruns", nullable = true)
    UUID previousRunId,

    @Schema(description = "Whether to include LLM judge assertions", example = "true", nullable = true)
    Boolean includeLlmJudge,

    @Schema(description = "Whether to include tool expectations", example = "true", nullable = true)
    Boolean includeToolExpectations,

    @Schema(description = "Maximum concurrent test executions", example = "3", nullable = true)
    @Min(value = 1, message = "Max concurrency must be at least 1")
    @Max(value = 50, message = "Max concurrency must not exceed 50")
    Integer maxConcurrency,

    @Schema(description = "Per-test timeout in milliseconds", example = "30000", nullable = true)
    @Min(value = 1000, message = "Timeout must be at least 1000 ms")
    @Max(value = 300000, message = "Timeout must not exceed 300000 ms")
    Integer timeoutMs,

    @Schema(description = "Retry count for failed target calls", example = "0", nullable = true)
    @Min(value = 0, message = "Retry count must be at least 0")
    @Max(value = 5, message = "Retry count must not exceed 5")
    Integer retryCount
) {}

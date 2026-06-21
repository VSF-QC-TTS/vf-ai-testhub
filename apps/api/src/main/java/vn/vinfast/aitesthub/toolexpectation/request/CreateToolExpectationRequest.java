package vn.vinfast.aitesthub.toolexpectation.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Request object for creating a tool expectation")
public record CreateToolExpectationRequest(
    @Schema(description = "Tool expectation type", example = "TOOL_MUST_BE_CALLED")
    @NotNull(message = "Expectation type is required")
    ToolExpectationType expectationType,

    @Schema(description = "Source that exposes tool/agent data", example = "normalized_tool_calls", nullable = true)
    TargetSourceType targetSource,

    @Schema(description = "Expected tool name", example = "search_product", nullable = true)
    @Size(max = 255, message = "Tool name must not exceed 255 characters")
    String toolName,

    @Schema(description = "Expected agent name", example = "product_search_agent", nullable = true)
    @Size(max = 255, message = "Agent name must not exceed 255 characters")
    String agentName,

    @Schema(description = "Assertions over tool arguments", nullable = true)
    List<Map<String, Object>> argumentAssertions,

    @Schema(description = "Expected tool sequence", nullable = true)
    List<String> sequence,

    @Schema(description = "Minimum expected call count", nullable = true)
    @Min(value = 0, message = "Min calls must be at least 0")
    Integer minCalls,

    @Schema(description = "Maximum expected call count", nullable = true)
    @Min(value = 0, message = "Max calls must be at least 0")
    Integer maxCalls,

    @Schema(description = "Rubric public UUID", nullable = true)
    UUID rubricId,

    @Schema(description = "Case-specific rubric override", nullable = true)
    String rubricOverride,

    @Schema(description = "Pass threshold", example = "0.8", nullable = true)
    @DecimalMin(value = "0.0", message = "Threshold must be at least 0")
    @DecimalMax(value = "1.0", message = "Threshold must not exceed 1")
    BigDecimal threshold,

    @Schema(description = "Whether this expectation is required", example = "true", nullable = true)
    Boolean required,

    @Schema(description = "Expectation severity", example = "MAJOR", nullable = true)
    SeverityLevel severity,

    @Schema(description = "Whether this expectation is enabled", example = "true", nullable = true)
    Boolean enabled,

    @Schema(description = "Sort order within the test case", example = "0", nullable = true)
    @Min(value = 0, message = "Sort order must be at least 0")
    @Max(value = 1000000, message = "Sort order must not exceed 1000000")
    Integer sortOrder
) {}

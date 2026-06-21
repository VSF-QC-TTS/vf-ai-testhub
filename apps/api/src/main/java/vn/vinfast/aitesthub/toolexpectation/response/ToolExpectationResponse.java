package vn.vinfast.aitesthub.toolexpectation.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
@Schema(description = "Response object representing a tool expectation")
public record ToolExpectationResponse(
    @Schema(description = "The public UUID of the tool expectation")
    UUID publicId,

    @Schema(description = "The public UUID of the owning test case")
    UUID testCasePublicId,

    @Schema(description = "Tool expectation type")
    ToolExpectationType expectationType,

    @Schema(description = "Source that exposes tool/agent data")
    TargetSourceType targetSource,

    @Schema(description = "Expected tool name")
    String toolName,

    @Schema(description = "Expected agent name")
    String agentName,

    @Schema(description = "Assertions over tool arguments")
    List<Map<String, Object>> argumentAssertions,

    @Schema(description = "Expected tool sequence")
    List<String> sequence,

    @Schema(description = "Minimum expected call count")
    Integer minCalls,

    @Schema(description = "Maximum expected call count")
    Integer maxCalls,

    @Schema(description = "Rubric public UUID")
    UUID rubricPublicId,

    @Schema(description = "Case-specific rubric override")
    String rubricOverride,

    @Schema(description = "Pass threshold")
    BigDecimal threshold,

    @Schema(description = "Whether this expectation is required")
    boolean required,

    @Schema(description = "Expectation severity")
    SeverityLevel severity,

    @Schema(description = "Whether this expectation is enabled")
    boolean enabled,

    @Schema(description = "Sort order within the test case")
    Integer sortOrder,

    @Schema(description = "When the tool expectation was created")
    OffsetDateTime createdAt,

    @Schema(description = "When the tool expectation was last updated")
    OffsetDateTime updatedAt
) {}

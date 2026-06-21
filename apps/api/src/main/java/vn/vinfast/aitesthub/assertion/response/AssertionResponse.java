package vn.vinfast.aitesthub.assertion.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
@Schema(description = "Response object representing an assertion")
public record AssertionResponse(
    @Schema(description = "The public UUID of the assertion")
    UUID publicId,

    @Schema(description = "The public UUID of the owning test case")
    UUID testCasePublicId,

    @Schema(description = "Assertion scope", example = "FIELD")
    AssertionScope scope,

    @Schema(description = "Assertion type", example = "contains")
    AssertionType type,

    @Schema(description = "Target response component")
    String targetComponent,

    @Schema(description = "JSON path for field-scoped assertions")
    String fieldPath,

    @Schema(description = "JSON paths for multi-field assertions")
    List<String> fieldPaths,

    @Schema(description = "Expected value for assertion types that require one")
    Object expectedValue,

    @Schema(description = "Rubric public UUID for llm_rubric assertions")
    UUID rubricPublicId,

    @Schema(description = "Case-specific rubric override")
    String rubricOverride,

    @Schema(description = "Pass threshold for llm_rubric assertions")
    BigDecimal threshold,

    @Schema(description = "Assertion weight")
    BigDecimal weight,

    @Schema(description = "Assertion severity")
    SeverityLevel severity,

    @Schema(description = "Whether this assertion is enabled")
    boolean enabled,

    @Schema(description = "Sort order within the test case")
    Integer sortOrder,

    @Schema(description = "When the assertion was created")
    OffsetDateTime createdAt,

    @Schema(description = "When the assertion was last updated")
    OffsetDateTime updatedAt
) {}

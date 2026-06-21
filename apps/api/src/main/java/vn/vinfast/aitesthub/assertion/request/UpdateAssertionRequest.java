package vn.vinfast.aitesthub.assertion.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Request object for updating an assertion")
public record UpdateAssertionRequest(
    @Schema(description = "Assertion scope", example = "FIELD", nullable = true)
    AssertionScope scope,

    @Schema(description = "Assertion type", example = "contains", nullable = true)
    AssertionType type,

    @Schema(description = "Target response component", example = "answer", nullable = true)
    @Size(max = 100, message = "Target component must not exceed 100 characters")
    String targetComponent,

    @Schema(description = "JSON path for field-scoped assertions", example = "$.answer", nullable = true)
    @Size(max = 500, message = "Field path must not exceed 500 characters")
    String fieldPath,

    @Schema(description = "JSON paths for multi-field assertions", nullable = true)
    List<String> fieldPaths,

    @Schema(description = "Expected value for assertion types that require one", nullable = true)
    Object expectedValue,

    @Schema(description = "Rubric public UUID for llm_rubric assertions", nullable = true)
    UUID rubricId,

    @Schema(description = "Case-specific rubric override", nullable = true)
    String rubricOverride,

    @Schema(description = "Pass threshold for llm_rubric assertions", example = "0.8", nullable = true)
    @DecimalMin(value = "0.0", message = "Threshold must be at least 0")
    @DecimalMax(value = "1.0", message = "Threshold must not exceed 1")
    BigDecimal threshold,

    @Schema(description = "Assertion weight", example = "1.0", nullable = true)
    @DecimalMin(value = "0.0001", message = "Weight must be positive")
    BigDecimal weight,

    @Schema(description = "Assertion severity", example = "MAJOR", nullable = true)
    SeverityLevel severity,

    @Schema(description = "Whether this assertion is enabled", example = "true", nullable = true)
    Boolean enabled,

    @Schema(description = "Sort order within the test case", example = "0", nullable = true)
    @Min(value = 0, message = "Sort order must be at least 0")
    @Max(value = 1000000, message = "Sort order must not exceed 1000000")
    Integer sortOrder
) {}

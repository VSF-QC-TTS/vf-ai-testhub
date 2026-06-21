package vn.vinfast.aitesthub.testcase.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Request object for creating a test case")
public record CreateTestCaseRequest(
    @Schema(description = "External ID from a legacy import source", example = "TC001", nullable = true)
    @Size(max = 255, message = "External ID must not exceed 255 characters")
    String externalId,

    @Schema(description = "Section or grouping name", example = "AI Search Mode > KB PNL > Vinfast", nullable = true)
    @Size(max = 500, message = "Section name must not exceed 500 characters")
    String sectionName,

    @Schema(description = "Human-readable test case name", example = "VF 8 versions", nullable = true)
    @Size(max = 500, message = "Name must not exceed 500 characters")
    String name,

    @Schema(description = "Test case description", nullable = true)
    String description,

    @Schema(description = "User input sent to the chatbot", example = "VinFast VF 8 có mấy phiên bản?")
    @NotBlank(message = "Input is required")
    String input,

    @Schema(description = "Expected chatbot behavior", example = "Bot answers with correct VF 8 versions.", nullable = true)
    String expectedBehavior,

    @Schema(description = "Reference answer for evaluators", nullable = true)
    String referenceAnswer,

    @Schema(description = "Variables used when rendering target templates", nullable = true)
    Map<String, Object> variables,

    @Schema(description = "Preconditions for this test case", nullable = true)
    String preconditions,

    @Schema(description = "Tags associated with this test case", example = "[\"vinfast\", \"regression\"]", nullable = true)
    List<String> tags,

    @Schema(description = "Priority of this test case", example = "P1", nullable = true)
    TestPriority priority,

    @Schema(description = "Whether this test case is enabled", example = "true", nullable = true)
    Boolean enabled,

    @Schema(description = "Sort order within the dataset", example = "0", nullable = true)
    @Min(value = 0, message = "Sort order must be at least 0")
    @Max(value = 1000000, message = "Sort order must not exceed 1000000")
    Integer sortOrder
) {}

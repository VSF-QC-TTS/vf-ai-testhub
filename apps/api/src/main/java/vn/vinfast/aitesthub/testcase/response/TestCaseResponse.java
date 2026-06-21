package vn.vinfast.aitesthub.testcase.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Builder
@Schema(description = "Response object representing a test case")
public record TestCaseResponse(
    @Schema(description = "The public UUID of the test case", example = "550e8400-e29b-41d4-a716-446655440000")
    UUID publicId,

    @Schema(description = "The public UUID of the owning dataset", example = "660e8400-e29b-41d4-a716-446655440000")
    UUID datasetPublicId,

    @Schema(description = "External ID from a legacy import source", example = "TC001")
    String externalId,

    @Schema(description = "Section or grouping name", example = "AI Search Mode > KB PNL > Vinfast")
    String sectionName,

    @Schema(description = "Human-readable test case name", example = "VF 8 versions")
    String name,

    @Schema(description = "Test case description")
    String description,

    @Schema(description = "User input sent to the chatbot", example = "VinFast VF 8 có mấy phiên bản?")
    String input,

    @Schema(description = "Expected chatbot behavior")
    String expectedBehavior,

    @Schema(description = "Reference answer for evaluators")
    String referenceAnswer,

    @Schema(description = "Variables used when rendering target templates")
    Map<String, Object> variables,

    @Schema(description = "Preconditions for this test case")
    String preconditions,

    @Schema(description = "Tags associated with this test case", example = "[\"vinfast\", \"regression\"]")
    List<String> tags,

    @Schema(description = "Priority of this test case", example = "P1")
    TestPriority priority,

    @Schema(description = "Whether this test case is enabled", example = "true")
    boolean enabled,

    @Schema(description = "Source of this test case", example = "MANUAL")
    TestCaseSource source,

    @Schema(description = "AI model or service that generated this test case")
    String generatedBy,

    @Schema(description = "Prompt used to generate this test case")
    String generationPrompt,

    @Schema(description = "Sort order within the dataset", example = "0")
    Integer sortOrder,

    @Schema(description = "When the test case was created")
    OffsetDateTime createdAt,

    @Schema(description = "When the test case was last updated")
    OffsetDateTime updatedAt
) {}

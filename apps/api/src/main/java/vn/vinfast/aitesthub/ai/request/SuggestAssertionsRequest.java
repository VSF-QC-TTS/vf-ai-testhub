package vn.vinfast.aitesthub.ai.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record SuggestAssertionsRequest(
    UUID testCaseId,
    @NotBlank String input,
    @NotBlank String expectedBehavior,
    String referenceAnswer,
    String responseMappingContext,
    String language,
    List<String> availableComponents,
    List<String> availableTools) {}

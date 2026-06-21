package vn.vinfast.aitesthub.ai.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record GenerateTestCasesRequest(
    UUID projectId,
    UUID datasetId,
    String projectContext,
    String datasetContext,
    @NotBlank String featureName,
    @NotBlank String businessRequirement,
    String policyContext,
    String mockData,
    String dbContext,
    String language,
    @Min(1) @Max(50) Integer count,
    List<String> categories,
    List<String> availableComponents,
    List<String> availableTools,
    List<UUID> defaultRubrics,
    List<UUID> existingTestcases) {}

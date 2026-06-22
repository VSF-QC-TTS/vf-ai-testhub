package vn.vinfast.aitesthub.ai.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.ai.request.GenerateTestCasesRequest;
import vn.vinfast.aitesthub.ai.request.SuggestAssertionsRequest;
import vn.vinfast.aitesthub.ai.response.AssertionSuggestionResponse;
import vn.vinfast.aitesthub.ai.response.TestCaseDraftBatchResponse;
import vn.vinfast.aitesthub.ai.service.AIGeneratorService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "AI Generator", description = "Endpoints for generating QC-reviewable AI drafts")
public class AIGeneratorController {

  private final AIGeneratorService aiGeneratorService;

  @Operation(summary = "Generate testcase drafts for a dataset")
  @ApiResponse(responseCode = "200", description = "Testcase drafts generated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid generation request")
  @ApiResponse(responseCode = "422", description = "AI provider returned malformed drafts")
  @PostMapping("/datasets/{datasetId}/ai-generate-testcases")
  public TestCaseDraftBatchResponse generateTestCases(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @Valid @RequestBody GenerateTestCasesRequest request) {
    return aiGeneratorService.generateTestCases(scopedGenerateRequest(datasetId, request));
  }

  @Operation(summary = "Suggest assertions for a testcase")
  @ApiResponse(responseCode = "200", description = "Assertion suggestions generated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid suggestion request")
  @ApiResponse(responseCode = "422", description = "AI provider returned malformed suggestions")
  @PostMapping("/test-cases/{testCaseId}/ai-suggest-assertions")
  public AssertionSuggestionResponse suggestAssertions(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @Valid @RequestBody SuggestAssertionsRequest request) {
    return aiGeneratorService.suggestAssertions(scopedSuggestionRequest(testCaseId, request));
  }

  private GenerateTestCasesRequest scopedGenerateRequest(
      UUID datasetId, GenerateTestCasesRequest request) {
    return new GenerateTestCasesRequest(
        request.projectId(),
        datasetId,
        request.projectContext(),
        request.datasetContext(),
        request.featureName(),
        request.businessRequirement(),
        request.policyContext(),
        request.mockData(),
        request.dbContext(),
        request.language(),
        request.count(),
        request.categories(),
        request.availableComponents(),
        request.availableTools(),
        request.defaultRubrics(),
        request.existingTestcases());
  }

  private SuggestAssertionsRequest scopedSuggestionRequest(
      UUID testCaseId, SuggestAssertionsRequest request) {
    return new SuggestAssertionsRequest(
        testCaseId,
        request.input(),
        request.expectedBehavior(),
        request.referenceAnswer(),
        request.responseMappingContext(),
        request.language(),
        request.availableComponents(),
        request.availableTools());
  }
}

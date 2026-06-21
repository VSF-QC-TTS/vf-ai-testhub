package vn.vinfast.aitesthub.toolexpectation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.toolexpectation.request.CreateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.request.UpdateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.response.ToolExpectationResponse;
import vn.vinfast.aitesthub.toolexpectation.service.ToolExpectationService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Tool Expectations", description = "Endpoints for managing tool and agent expectations")
public class ToolExpectationController {

  private final ToolExpectationService toolExpectationService;

  @Operation(summary = "Create a tool expectation in a test case")
  @ApiResponse(responseCode = "201", description = "Tool expectation created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Test case or rubric not found")
  @PostMapping("/test-cases/{testCaseId}/tool-expectations")
  @ResponseStatus(HttpStatus.CREATED)
  public ToolExpectationResponse createToolExpectation(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @Valid @RequestBody CreateToolExpectationRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return toolExpectationService.createToolExpectation(testCaseId, request, jwt.getSubject());
  }

  @Operation(summary = "Get paginated tool expectations for a test case")
  @ApiResponse(responseCode = "200", description = "Tool expectations retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Test case not found")
  @GetMapping("/test-cases/{testCaseId}/tool-expectations")
  public Page<ToolExpectationResponse> getToolExpectations(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @ParameterObject Pageable pageable) {
    return toolExpectationService.getToolExpectations(testCaseId, pageable);
  }

  @Operation(summary = "Get tool expectation details by public ID")
  @ApiResponse(responseCode = "200", description = "Tool expectation retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Tool expectation not found")
  @GetMapping("/tool-expectations/{expectationId}")
  public ToolExpectationResponse getToolExpectation(
      @Parameter(description = "The public UUID of the tool expectation") @PathVariable UUID expectationId) {
    return toolExpectationService.getToolExpectation(expectationId);
  }

  @Operation(summary = "Update a tool expectation")
  @ApiResponse(responseCode = "200", description = "Tool expectation updated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Tool expectation not found")
  @PutMapping("/tool-expectations/{expectationId}")
  public ToolExpectationResponse updateToolExpectation(
      @Parameter(description = "The public UUID of the tool expectation") @PathVariable UUID expectationId,
      @Valid @RequestBody UpdateToolExpectationRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return toolExpectationService.updateToolExpectation(expectationId, request, jwt.getSubject());
  }

  @Operation(summary = "Delete a tool expectation")
  @ApiResponse(responseCode = "204", description = "Tool expectation deleted successfully")
  @ApiResponse(responseCode = "404", description = "Tool expectation not found")
  @DeleteMapping("/tool-expectations/{expectationId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteToolExpectation(
      @Parameter(description = "The public UUID of the tool expectation") @PathVariable UUID expectationId,
      @AuthenticationPrincipal Jwt jwt) {
    toolExpectationService.deleteToolExpectation(expectationId, jwt.getSubject());
  }
}

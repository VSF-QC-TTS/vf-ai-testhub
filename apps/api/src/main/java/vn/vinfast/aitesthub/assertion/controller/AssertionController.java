package vn.vinfast.aitesthub.assertion.controller;

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
import vn.vinfast.aitesthub.assertion.request.CreateAssertionRequest;
import vn.vinfast.aitesthub.assertion.request.UpdateAssertionRequest;
import vn.vinfast.aitesthub.assertion.response.AssertionResponse;
import vn.vinfast.aitesthub.assertion.service.AssertionService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Assertions", description = "Endpoints for managing test case assertions")
public class AssertionController {

  private final AssertionService assertionService;

  @Operation(summary = "Create an assertion in a test case")
  @ApiResponse(responseCode = "201", description = "Assertion created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Test case or rubric not found")
  @PostMapping("/test-cases/{testCaseId}/assertions")
  @ResponseStatus(HttpStatus.CREATED)
  public AssertionResponse createAssertion(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @Valid @RequestBody CreateAssertionRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return assertionService.createAssertion(testCaseId, request, jwt.getSubject());
  }

  @Operation(summary = "Get paginated assertions for a test case")
  @ApiResponse(responseCode = "200", description = "Assertions retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Test case not found")
  @GetMapping("/test-cases/{testCaseId}/assertions")
  public Page<AssertionResponse> getAssertions(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @ParameterObject Pageable pageable) {
    return assertionService.getAssertions(testCaseId, pageable);
  }

  @Operation(summary = "Get assertion details by public ID")
  @ApiResponse(responseCode = "200", description = "Assertion retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Assertion not found")
  @GetMapping("/assertions/{assertionId}")
  public AssertionResponse getAssertion(
      @Parameter(description = "The public UUID of the assertion") @PathVariable UUID assertionId) {
    return assertionService.getAssertion(assertionId);
  }

  @Operation(summary = "Update an assertion")
  @ApiResponse(responseCode = "200", description = "Assertion updated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Assertion not found")
  @PutMapping("/assertions/{assertionId}")
  public AssertionResponse updateAssertion(
      @Parameter(description = "The public UUID of the assertion") @PathVariable UUID assertionId,
      @Valid @RequestBody UpdateAssertionRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return assertionService.updateAssertion(assertionId, request, jwt.getSubject());
  }

  @Operation(summary = "Delete an assertion")
  @ApiResponse(responseCode = "204", description = "Assertion deleted successfully")
  @ApiResponse(responseCode = "404", description = "Assertion not found")
  @DeleteMapping("/assertions/{assertionId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteAssertion(
      @Parameter(description = "The public UUID of the assertion") @PathVariable UUID assertionId,
      @AuthenticationPrincipal Jwt jwt) {
    assertionService.deleteAssertion(assertionId, jwt.getSubject());
  }
}

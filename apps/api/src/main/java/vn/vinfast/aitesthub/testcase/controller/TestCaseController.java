package vn.vinfast.aitesthub.testcase.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;
import vn.vinfast.aitesthub.testcase.request.CreateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.request.TestCaseFilter;
import vn.vinfast.aitesthub.testcase.request.UpdateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.response.TestCaseResponse;
import vn.vinfast.aitesthub.testcase.service.TestCaseService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Test Cases", description = "Endpoints for managing dataset test cases")
public class TestCaseController {

  private final TestCaseService testCaseService;

  @Operation(summary = "Create a test case in a dataset")
  @ApiResponse(responseCode = "201", description = "Test case created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @PostMapping("/datasets/{datasetId}/test-cases")
  @ResponseStatus(HttpStatus.CREATED)
  public TestCaseResponse createTestCase(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @Valid @RequestBody CreateTestCaseRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return testCaseService.createTestCase(datasetId, request, jwt.getSubject());
  }

  @Operation(summary = "Get paginated test cases for a dataset")
  @ApiResponse(responseCode = "200", description = "Test cases retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @GetMapping("/datasets/{datasetId}/test-cases")
  public Page<TestCaseResponse> getTestCases(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @RequestParam(required = false) String sectionName,
      @RequestParam(required = false) TestPriority priority,
      @RequestParam(required = false) Boolean enabled,
      @RequestParam(required = false) TestCaseSource source,
      @RequestParam(required = false) String tag,
      @RequestParam(required = false) String search,
      @ParameterObject Pageable pageable) {
    TestCaseFilter filter = new TestCaseFilter(sectionName, priority, enabled, source, tag, search);
    return testCaseService.getTestCases(datasetId, filter, pageable);
  }

  @Operation(summary = "Get test case details by public ID")
  @ApiResponse(responseCode = "200", description = "Test case retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Test case not found")
  @GetMapping("/test-cases/{testCaseId}")
  public TestCaseResponse getTestCase(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId) {
    return testCaseService.getTestCase(testCaseId);
  }

  @Operation(summary = "Update a test case")
  @ApiResponse(responseCode = "200", description = "Test case updated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Test case not found")
  @PutMapping("/test-cases/{testCaseId}")
  public TestCaseResponse updateTestCase(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @Valid @RequestBody UpdateTestCaseRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return testCaseService.updateTestCase(testCaseId, request, jwt.getSubject());
  }

  @Operation(summary = "Delete a test case")
  @ApiResponse(responseCode = "204", description = "Test case deleted successfully")
  @ApiResponse(responseCode = "404", description = "Test case not found")
  @DeleteMapping("/test-cases/{testCaseId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteTestCase(
      @Parameter(description = "The public UUID of the test case") @PathVariable UUID testCaseId,
      @AuthenticationPrincipal Jwt jwt) {
    testCaseService.deleteTestCase(testCaseId, jwt.getSubject());
  }
}

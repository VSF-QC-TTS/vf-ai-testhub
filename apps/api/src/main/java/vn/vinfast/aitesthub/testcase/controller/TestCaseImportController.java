package vn.vinfast.aitesthub.testcase.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.vinfast.aitesthub.testcase.request.ConfirmTestCaseImportRequest;
import vn.vinfast.aitesthub.testcase.response.ImportConfirmResponse;
import vn.vinfast.aitesthub.testcase.response.ImportPreviewResponse;
import vn.vinfast.aitesthub.testcase.service.TestCaseImportService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@RestController
@RequestMapping("/api/v1/datasets/{datasetId}/test-cases/import")
@RequiredArgsConstructor
@Tag(name = "Test Case Imports", description = "Endpoints for importing test cases")
public class TestCaseImportController {

  private final TestCaseImportService testCaseImportService;

  @Operation(summary = "Preview a CSV or Excel test case import")
  @ApiResponse(responseCode = "200", description = "Import preview created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid or empty import file")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @PostMapping("/preview")
  public ImportPreviewResponse previewImport(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @RequestPart("file") MultipartFile file,
      @AuthenticationPrincipal Jwt jwt) {
    return testCaseImportService.previewImport(datasetId, file, jwt.getSubject());
  }

  @Operation(summary = "Confirm a test case import preview")
  @ApiResponse(responseCode = "201", description = "Import confirmed successfully")
  @ApiResponse(responseCode = "400", description = "Invalid import preview or mapping")
  @ApiResponse(responseCode = "404", description = "Dataset or import preview not found")
  @PostMapping("/confirm")
  @ResponseStatus(HttpStatus.CREATED)
  public ImportConfirmResponse confirmImport(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @Valid @RequestBody ConfirmTestCaseImportRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return testCaseImportService.confirmImport(datasetId, request, jwt.getSubject());
  }
}

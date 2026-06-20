package vn.vinfast.aitesthub.dataset.controller;

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
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;
import vn.vinfast.aitesthub.dataset.service.DatasetService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Datasets", description = "Endpoints for managing evaluation datasets")
public class DatasetController {

  private final DatasetService datasetService;

  @Operation(summary = "Create a new dataset in a project")
  @ApiResponse(responseCode = "201", description = "Dataset created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request or dataset name already exists")
  @ApiResponse(responseCode = "404", description = "Project not found")
  @PostMapping("/projects/{projectId}/datasets")
  @ResponseStatus(HttpStatus.CREATED)
  public DatasetResponse createDataset(
      @Parameter(description = "The public UUID of the project") @PathVariable UUID projectId,
      @Valid @RequestBody CreateDatasetRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return datasetService.createDataset(projectId, request, jwt.getSubject());
  }

  @Operation(summary = "Get paginated active datasets for a project")
  @ApiResponse(responseCode = "200", description = "List of datasets retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Project not found")
  @GetMapping("/projects/{projectId}/datasets")
  public Page<DatasetResponse> getDatasetsByProject(
      @Parameter(description = "The public UUID of the project") @PathVariable UUID projectId,
      @ParameterObject Pageable pageable) {
    return datasetService.getDatasetsByProject(projectId, pageable);
  }

  @Operation(summary = "Get dataset details by its public ID")
  @ApiResponse(responseCode = "200", description = "Dataset retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @GetMapping("/datasets/{datasetId}")
  public DatasetResponse getDataset(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId) {
    return datasetService.getDataset(datasetId);
  }

  @Operation(summary = "Update dataset configuration")
  @ApiResponse(responseCode = "200", description = "Dataset updated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request or dataset name already exists")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @ApiResponse(responseCode = "409", description = "Dataset or project is archived")
  @PutMapping("/datasets/{datasetId}")
  public DatasetResponse updateDataset(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @Valid @RequestBody UpdateDatasetRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return datasetService.updateDataset(datasetId, request, jwt.getSubject());
  }

  @Operation(summary = "Archive a dataset")
  @ApiResponse(responseCode = "204", description = "Dataset archived successfully")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @DeleteMapping("/datasets/{datasetId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void archiveDataset(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @AuthenticationPrincipal Jwt jwt) {
    datasetService.archiveDataset(datasetId, jwt.getSubject());
  }
}

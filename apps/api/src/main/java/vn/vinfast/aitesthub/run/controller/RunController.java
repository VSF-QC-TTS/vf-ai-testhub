package vn.vinfast.aitesthub.run.controller;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.response.RunResponse;
import vn.vinfast.aitesthub.run.service.RunService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Runs", description = "Endpoints for triggering and tracking evaluation runs")
public class RunController {

  private final RunService runService;

  @Operation(summary = "Trigger an asynchronous dataset run")
  @ApiResponse(responseCode = "202", description = "Run accepted and published")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Dataset or target not found")
  @PostMapping("/datasets/{datasetId}/runs")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public RunResponse triggerRun(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @Valid @RequestBody RunRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return runService.triggerRun(datasetId, request, jwt.getSubject());
  }

  @Operation(summary = "Get run status by public ID")
  @ApiResponse(responseCode = "200", description = "Run retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Run not found")
  @GetMapping("/runs/{runId}")
  public RunResponse getRun(
      @Parameter(description = "The public UUID of the run") @PathVariable UUID runId) {
    return runService.getRun(runId);
  }

  @Operation(summary = "Get paginated run history for a dataset")
  @ApiResponse(responseCode = "200", description = "Runs retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Dataset not found")
  @GetMapping("/datasets/{datasetId}/runs")
  public Page<RunResponse> getRunsByDataset(
      @Parameter(description = "The public UUID of the dataset") @PathVariable UUID datasetId,
      @ParameterObject Pageable pageable) {
    return runService.getRunsByDataset(datasetId, pageable);
  }
}

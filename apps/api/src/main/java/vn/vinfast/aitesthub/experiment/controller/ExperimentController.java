package vn.vinfast.aitesthub.experiment.controller;

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
import vn.vinfast.aitesthub.experiment.request.CreateExperimentRequest;
import vn.vinfast.aitesthub.experiment.response.ExperimentResponse;
import vn.vinfast.aitesthub.experiment.service.ExperimentService;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Experiments", description = "A/B experiment management APIs")
public class ExperimentController {

  private final ExperimentService experimentService;

  @Operation(summary = "Create a draft experiment")
  @ApiResponse(responseCode = "201", description = "Experiment created successfully")
  @PostMapping("/projects/{projectId}/experiments")
  @ResponseStatus(HttpStatus.CREATED)
  public ExperimentResponse create(
      @Parameter(description = "Project public UUID") @PathVariable UUID projectId,
      @Valid @RequestBody CreateExperimentRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return experimentService.create(projectId, request, jwt.getSubject());
  }

  @Operation(summary = "List project experiments")
  @ApiResponse(responseCode = "200", description = "Experiments retrieved successfully")
  @GetMapping("/projects/{projectId}/experiments")
  public Page<ExperimentResponse> listByProject(
      @Parameter(description = "Project public UUID") @PathVariable UUID projectId,
      @ParameterObject Pageable pageable) {
    return experimentService.listByProject(projectId, pageable);
  }

  @Operation(summary = "Get experiment detail")
  @ApiResponse(responseCode = "200", description = "Experiment retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Experiment not found")
  @GetMapping("/experiments/{experimentId}")
  public ExperimentResponse get(
      @Parameter(description = "Experiment public UUID") @PathVariable UUID experimentId) {
    return experimentService.get(experimentId);
  }

  @Operation(summary = "Start experiment")
  @ApiResponse(responseCode = "202", description = "Experiment started successfully")
  @ApiResponse(responseCode = "422", description = "Experiment cannot be started")
  @PostMapping("/experiments/{experimentId}/start")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public ExperimentResponse start(
      @Parameter(description = "Experiment public UUID") @PathVariable UUID experimentId,
      @AuthenticationPrincipal Jwt jwt) {
    return experimentService.start(experimentId, jwt.getSubject());
  }

  @Operation(summary = "Compare experiment variants")
  @ApiResponse(responseCode = "200", description = "Experiment comparison retrieved successfully")
  @ApiResponse(responseCode = "422", description = "Experiment cannot be compared yet")
  @GetMapping("/experiments/{experimentId}/comparison")
  public RunComparisonResponse compare(
      @Parameter(description = "Experiment public UUID") @PathVariable UUID experimentId) {
    return experimentService.compare(experimentId);
  }
}

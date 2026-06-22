package vn.vinfast.aitesthub.result.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;
import vn.vinfast.aitesthub.result.response.RunReportResponse;
import vn.vinfast.aitesthub.result.response.TestResultReportItem;
import vn.vinfast.aitesthub.result.service.RunComparisonService;
import vn.vinfast.aitesthub.result.service.ReportService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Results", description = "Endpoints for run result reports")
public class ResultController {

  private final ReportService reportService;
  private final RunComparisonService runComparisonService;

  @Operation(summary = "Get aggregate report for a run")
  @ApiResponse(responseCode = "200", description = "Report retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Run not found")
  @GetMapping("/runs/{runId}/report")
  public RunReportResponse getRunReport(
      @Parameter(description = "The public UUID of the run") @PathVariable UUID runId) {
    return reportService.getRunReport(runId);
  }

  @Operation(summary = "List result details for a run")
  @ApiResponse(responseCode = "200", description = "Results retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Run not found")
  @GetMapping("/runs/{runId}/results")
  public List<TestResultReportItem> getRunResults(
      @Parameter(description = "The public UUID of the run") @PathVariable UUID runId) {
    return reportService.getRunReport(runId).results();
  }

  @Operation(summary = "Compare two completed runs")
  @ApiResponse(responseCode = "200", description = "Run comparison retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Run not found")
  @ApiResponse(responseCode = "422", description = "Runs are not completed or comparable")
  @GetMapping("/runs/compare")
  public RunComparisonResponse compareRuns(
      @Parameter(description = "Baseline run public UUID") @RequestParam UUID baseRunId,
      @Parameter(description = "Candidate run public UUID") @RequestParam UUID candidateRunId) {
    return runComparisonService.compareRuns(baseRunId, candidateRunId);
  }
}

package vn.vinfast.aitesthub.result.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.result.request.ManualReviewBatchRequest;
import vn.vinfast.aitesthub.result.response.ManualReviewBatchResponse;
import vn.vinfast.aitesthub.result.service.ManualReviewService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Manual Reviews", description = "Endpoints for QC result overrides")
public class ManualReviewController {

  private final ManualReviewService manualReviewService;

  @Operation(summary = "Submit manual review decisions for a run")
  @ApiResponse(responseCode = "200", description = "Reviews persisted successfully")
  @ApiResponse(responseCode = "400", description = "Invalid review request")
  @ApiResponse(responseCode = "404", description = "Run or result not found")
  @PostMapping("/runs/{runId}/review")
  public ManualReviewBatchResponse reviewRunResults(
      @Parameter(description = "The public UUID of the run") @PathVariable UUID runId,
      @Valid @RequestBody ManualReviewBatchRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return manualReviewService.reviewRunResults(runId, request, jwt.getSubject());
  }
}

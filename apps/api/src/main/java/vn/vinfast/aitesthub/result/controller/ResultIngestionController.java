package vn.vinfast.aitesthub.result.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.config.WorkerProperties;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.result.request.ResultIngestionRequest;
import vn.vinfast.aitesthub.result.service.ResultIngestionService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
@Tag(name = "Result Ingestion", description = "Internal endpoints for runner result callbacks")
public class ResultIngestionController {

  private static final String RUNNER_TOKEN_HEADER = "X-Runner-Token";

  private final ResultIngestionService resultIngestionService;
  private final WorkerProperties workerProperties;

  @Operation(summary = "Ingest a runner result batch")
  @ApiResponse(responseCode = "202", description = "Result batch accepted")
  @ApiResponse(responseCode = "401", description = "Invalid runner token")
  @ApiResponse(responseCode = "404", description = "Run or referenced entity not found")
  @PostMapping("/runs/{runId}/results")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public void ingestResults(
      @Parameter(description = "The public UUID of the run") @PathVariable UUID runId,
      @RequestHeader(value = RUNNER_TOKEN_HEADER, required = false) String runnerToken,
      @Valid @RequestBody ResultIngestionRequest request) {
    verifyRunnerToken(runnerToken);
    resultIngestionService.ingestRunResults(runId, request);
  }

  private void verifyRunnerToken(String runnerToken) {
    String expectedToken = workerProperties.getRunnerToken();
    if (!StringUtils.hasText(expectedToken)
        || !StringUtils.hasText(runnerToken)
        || !MessageDigest.isEqual(bytes(expectedToken), bytes(runnerToken))) {
      throw new ResourceException(ErrorCode.UNAUTHORIZED);
    }
  }

  private byte[] bytes(String value) {
    return value.getBytes(StandardCharsets.UTF_8);
  }
}

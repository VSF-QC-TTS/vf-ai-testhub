package vn.vinfast.aitesthub.target.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;
import vn.vinfast.aitesthub.target.service.CurlParserService;
import vn.vinfast.aitesthub.target.service.TargetService;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/targets")
@RequiredArgsConstructor
@Tag(name = "Target APIs", description = "Manage targets")
public class TargetController {

  private final TargetService targetService;
  private final CurlParserService curlParserService;

  @Operation(summary = "Parse cURL command to get Target preview")
  @PostMapping("/parse-curl")
  public ResponseEntity<TargetResponse> parseCurl(
      @PathVariable UUID projectId,
      @Valid @RequestBody Map<String, String> request) {

    String curlCommand = request.get("curlCommand");
    String name = request.get("name");
    String environment = request.get("environment");

    CurlParserService.ParsedCurl parsedCurl = curlParserService.parseCurl(curlCommand);

    TargetResponse response = new TargetResponse(
        null,
        projectId,
        name,
        environment,
        vn.vinfast.aitesthub.target.enums.TargetType.HTTP,
        parsedCurl.method,
        parsedCurl.url,
        parsedCurl.queryParamsTemplate,
        parsedCurl.headersTemplate,
        parsedCurl.bodyTemplate,
        null, // authConfig
        null, // llmProvider
        null, // llmModel
        null, // llmBaseUrl
        null, // llmKeyRef
        null, // inputBinding
        null, // variableBindings
        30000, // timeoutMs
        false, // isDefault
        null, // responseMapping
        null,
        null
    );

    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Create a target")
  @PostMapping
  public ResponseEntity<TargetResponse> createTarget(
      @PathVariable UUID projectId,
      @Valid @RequestBody TargetRequest request) {
    TargetResponse response = targetService.createTarget(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @Operation(summary = "Get project targets")
  @GetMapping
  public ResponseEntity<Page<TargetResponse>> getTargets(
      @PathVariable UUID projectId,
      Pageable pageable) {
    return ResponseEntity.ok(targetService.getTargets(projectId, pageable));
  }
}

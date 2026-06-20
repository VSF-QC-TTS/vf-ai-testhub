package vn.vinfast.aitesthub.target.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.target.request.ResponseMappingRequest;
import vn.vinfast.aitesthub.target.response.ResponseMappingResponse;
import vn.vinfast.aitesthub.target.service.ResponseMappingService;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@RestController
@RequestMapping("/api/v1/targets/{targetId}/response-mapping")
@RequiredArgsConstructor
@Tag(name = "Response Mapping APIs", description = "Manage target response mappings")
public class ResponseMappingController {

  private final ResponseMappingService responseMappingService;

  @Operation(summary = "Get response mapping by target ID")
  @GetMapping
  public ResponseEntity<ResponseMappingResponse> getResponseMapping(@PathVariable UUID targetId) {
    ResponseMappingResponse response = responseMappingService.getResponseMapping(targetId);
    if (response == null) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Save or update response mapping")
  @PutMapping
  public ResponseEntity<ResponseMappingResponse> saveResponseMapping(
      @PathVariable UUID targetId,
      @Valid @RequestBody ResponseMappingRequest request) {
    return ResponseEntity.ok(responseMappingService.saveResponseMapping(targetId, request));
  }
}
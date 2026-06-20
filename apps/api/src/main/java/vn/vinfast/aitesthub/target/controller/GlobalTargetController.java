package vn.vinfast.aitesthub.target.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;
import vn.vinfast.aitesthub.target.service.TargetService;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@RestController
@RequestMapping("/api/v1/targets")
@RequiredArgsConstructor
@Tag(name = "Global Target APIs", description = "Target APIs without project context")
public class GlobalTargetController {

  private final TargetService targetService;

  @Operation(summary = "Get Target by ID")
  @GetMapping("/{targetId}")
  public ResponseEntity<TargetResponse> getTarget(@PathVariable UUID targetId) {
    return ResponseEntity.ok(targetService.getTarget(targetId));
  }

  @Operation(summary = "Update Target")
  @PutMapping("/{targetId}")
  public ResponseEntity<TargetResponse> updateTarget(
      @PathVariable UUID targetId,
      @Valid @RequestBody TargetRequest request) {
    return ResponseEntity.ok(targetService.updateTarget(targetId, request));
  }

  @Operation(summary = "Delete Target")
  @DeleteMapping("/{targetId}")
  public ResponseEntity<Void> deleteTarget(@PathVariable UUID targetId) {
    targetService.deleteTarget(targetId);
    return ResponseEntity.noContent().build();
  }
}

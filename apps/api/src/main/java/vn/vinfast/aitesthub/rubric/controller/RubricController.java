package vn.vinfast.aitesthub.rubric.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.rubric.request.CreateRubricRequest;
import vn.vinfast.aitesthub.rubric.request.RubricFilter;
import vn.vinfast.aitesthub.rubric.request.UpdateRubricRequest;
import vn.vinfast.aitesthub.rubric.response.RubricResponse;
import vn.vinfast.aitesthub.rubric.service.RubricService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Rubrics", description = "Endpoints for managing reusable LLM judge rubrics")
public class RubricController {

  private final RubricService rubricService;

  @Operation(summary = "Create a rubric in a project")
  @ApiResponse(responseCode = "201", description = "Rubric created successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Project or dataset not found")
  @PostMapping("/projects/{projectId}/rubrics")
  @ResponseStatus(HttpStatus.CREATED)
  public RubricResponse createRubric(
      @Parameter(description = "The public UUID of the project") @PathVariable UUID projectId,
      @Valid @RequestBody CreateRubricRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return rubricService.createRubric(projectId, request, jwt.getSubject());
  }

  @Operation(summary = "Get paginated rubrics for a project")
  @ApiResponse(responseCode = "200", description = "Rubrics retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Project not found")
  @GetMapping("/projects/{projectId}/rubrics")
  public Page<RubricResponse> getProjectRubrics(
      @Parameter(description = "The public UUID of the project") @PathVariable UUID projectId,
      @RequestParam(required = false) RubricCategory category,
      @RequestParam(required = false) RubricScope scope,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Boolean archived,
      @ParameterObject Pageable pageable) {
    RubricFilter filter = new RubricFilter(category, scope, search, archived);
    return rubricService.getRubricsByProject(projectId, filter, pageable);
  }

  @Operation(summary = "Get paginated global rubrics")
  @ApiResponse(responseCode = "200", description = "Global rubrics retrieved successfully")
  @GetMapping("/rubrics/global")
  public Page<RubricResponse> getGlobalRubrics(
      @RequestParam(required = false) RubricCategory category,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Boolean archived,
      @ParameterObject Pageable pageable) {
    RubricFilter filter = new RubricFilter(category, RubricScope.GLOBAL, search, archived);
    return rubricService.getGlobalRubrics(filter, pageable);
  }

  @Operation(summary = "Get rubric details by public ID")
  @ApiResponse(responseCode = "200", description = "Rubric retrieved successfully")
  @ApiResponse(responseCode = "404", description = "Rubric not found")
  @GetMapping("/rubrics/{rubricId}")
  public RubricResponse getRubric(
      @Parameter(description = "The public UUID of the rubric") @PathVariable UUID rubricId) {
    return rubricService.getRubric(rubricId);
  }

  @Operation(summary = "Update a rubric")
  @ApiResponse(responseCode = "200", description = "Rubric updated successfully")
  @ApiResponse(responseCode = "400", description = "Invalid request")
  @ApiResponse(responseCode = "404", description = "Rubric not found")
  @PutMapping("/rubrics/{rubricId}")
  public RubricResponse updateRubric(
      @Parameter(description = "The public UUID of the rubric") @PathVariable UUID rubricId,
      @Valid @RequestBody UpdateRubricRequest request,
      @AuthenticationPrincipal Jwt jwt) {
    return rubricService.updateRubric(rubricId, request, jwt.getSubject());
  }

  @Operation(summary = "Archive a rubric")
  @ApiResponse(responseCode = "204", description = "Rubric archived successfully")
  @ApiResponse(responseCode = "404", description = "Rubric not found")
  @DeleteMapping("/rubrics/{rubricId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void archiveRubric(
      @Parameter(description = "The public UUID of the rubric") @PathVariable UUID rubricId,
      @AuthenticationPrincipal Jwt jwt) {
    rubricService.archiveRubric(rubricId, jwt.getSubject());
  }
}

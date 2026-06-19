package vn.vinfast.aitesthub.project.controller;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.vinfast.aitesthub.project.request.ProjectRequest;
import vn.vinfast.aitesthub.project.response.ProjectResponse;
import vn.vinfast.aitesthub.project.service.ProjectService;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management APIs")
public class ProjectController {

  private final ProjectService projectService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Create a new project")
  public ProjectResponse create(
      @Valid @RequestBody ProjectRequest request, Principal principal) {
    return projectService.create(request, principal.getName());
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get a project by ID")
  public ProjectResponse findById(
      @Parameter(description = "Project ID (UUID)") @PathVariable UUID id) {
    return projectService.findById(id);
  }

  @GetMapping
  @Operation(summary = "Get all active projects (paginated)")
  public Page<ProjectResponse> findAll(
      @Parameter(description = "Pagination parameters") @PageableDefault(size = 20) Pageable pageable) {
    return projectService.findAll(pageable);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update an existing project")
  public ProjectResponse update(
      @Parameter(description = "Project ID (UUID)") @PathVariable UUID id,
      @Valid @RequestBody ProjectRequest request) {
    return projectService.update(id, request);
  }

  @PatchMapping("/{id}/archive")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Archive a project")
  public void archive(
      @Parameter(description = "Project ID (UUID)") @PathVariable UUID id) {
    projectService.archive(id);
  }
}

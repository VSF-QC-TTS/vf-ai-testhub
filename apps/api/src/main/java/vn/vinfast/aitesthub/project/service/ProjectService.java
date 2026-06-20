package vn.vinfast.aitesthub.project.service;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */


import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import vn.vinfast.aitesthub.project.request.ProjectRequest;
import vn.vinfast.aitesthub.project.response.ProjectResponse;

@Validated
public interface ProjectService {

  /**
   * Creates a new project configuration.
   *
   * @param request the validated {@link ProjectRequest}
   * @param ownerUsername the username of the user creating the project
   * @return the created {@link ProjectResponse}
   */
  ProjectResponse create(@Valid ProjectRequest request, String ownerUsername);

  /**
   * Retrieves a specific project by its ID.
   *
   * @param id the public ID of the {@link vn.vinfast.aitesthub.project.entity.Project}
   * @return the {@link ProjectResponse}
   */
  ProjectResponse findById(UUID id);

  /**
   * Retrieves a paginated list of active (non-archived) projects.
   *
   * @param pageable pagination information
   * @return a paginated {@link ProjectResponse}
   */
  Page<ProjectResponse> findAll(Pageable pageable);

  /**
   * Updates an existing project configuration.
   *
   * @param id the public ID of the {@link vn.vinfast.aitesthub.project.entity.Project}
   * @param request the validated {@link ProjectRequest}
   * @return the updated {@link ProjectResponse}
   */
  ProjectResponse update(UUID id, @Valid ProjectRequest request);

  /**
   * Archives a specific project.
   *
   * @param id the public ID of the {@link vn.vinfast.aitesthub.project.entity.Project}
   */
  void archive(UUID id);
}

package vn.vinfast.aitesthub.rubric.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.rubric.request.CreateRubricRequest;
import vn.vinfast.aitesthub.rubric.request.RubricFilter;
import vn.vinfast.aitesthub.rubric.request.UpdateRubricRequest;
import vn.vinfast.aitesthub.rubric.response.RubricResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Validated
public interface RubricService {

  /**
   * Creates a rubric inside a project.
   *
   * @param projectPublicId the public ID of the owning {@link vn.vinfast.aitesthub.project.entity.Project}
   * @param request the validated {@link CreateRubricRequest}
   * @param username the username of the authenticated user creating the rubric
   * @return the created {@link RubricResponse}
   */
  RubricResponse createRubric(
      UUID projectPublicId, @Valid CreateRubricRequest request, String username);

  /**
   * Retrieves a rubric by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.rubric.entity.Rubric}
   * @return the matching {@link RubricResponse}
   */
  RubricResponse getRubric(UUID publicId);

  /**
   * Retrieves rubrics visible within a project using pagination and optional filters.
   *
   * @param projectPublicId the public ID of the owning {@link vn.vinfast.aitesthub.project.entity.Project}
   * @param filter optional listing filters
   * @param pageable pagination information
   * @return a paginated {@link RubricResponse}
   */
  Page<RubricResponse> getRubricsByProject(
      UUID projectPublicId, RubricFilter filter, Pageable pageable);

  /**
   * Retrieves global rubrics using pagination and optional filters.
   *
   * @param filter optional listing filters
   * @param pageable pagination information
   * @return a paginated {@link RubricResponse}
   */
  Page<RubricResponse> getGlobalRubrics(RubricFilter filter, Pageable pageable);

  /**
   * Updates a rubric by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.rubric.entity.Rubric}
   * @param request the validated {@link UpdateRubricRequest}
   * @param username the username of the authenticated user updating the rubric
   * @return the updated {@link RubricResponse}
   */
  RubricResponse updateRubric(UUID publicId, @Valid UpdateRubricRequest request, String username);

  /**
   * Archives a rubric by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.rubric.entity.Rubric}
   * @param username the username of the authenticated user archiving the rubric
   */
  void archiveRubric(UUID publicId, String username);
}

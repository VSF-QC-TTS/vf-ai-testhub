package vn.vinfast.aitesthub.target.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Validated
public interface TargetService {

  /**
   * Retrieves a paginated list of targets for a given project.
   *
   * @param projectId the public ID of the {@link vn.vinfast.aitesthub.project.entity.Project}
   * @param pageable  pagination information
   * @return a paginated {@link TargetResponse}
   */
  Page<TargetResponse> getTargets(UUID projectId, Pageable pageable);

  /**
   * Retrieves a specific target by its ID.
   *
   * @param targetId the public ID of the {@link vn.vinfast.aitesthub.target.entity.Target}
   * @return the {@link TargetResponse}
   */
  TargetResponse getTarget(UUID targetId);

  /**
   * Creates a new target configuration.
   *
   * @param request the validated {@link TargetRequest}
   * @return the created {@link TargetResponse}
   */
  TargetResponse createTarget(@Valid TargetRequest request);

  /**
   * Updates an existing target configuration.
   *
   * @param targetId the public ID of the {@link vn.vinfast.aitesthub.target.entity.Target}
   * @param request  the validated {@link TargetRequest}
   * @return the updated {@link TargetResponse}
   */
  TargetResponse updateTarget(UUID targetId, @Valid TargetRequest request);

  /**
   * Deletes a specific target configuration.
   *
   * @param targetId the public ID of the {@link vn.vinfast.aitesthub.target.entity.Target}
   */
  void deleteTarget(UUID targetId);
}

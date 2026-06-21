package vn.vinfast.aitesthub.run.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.response.RunResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Validated
public interface RunService {

  /**
   * Triggers an asynchronous dataset run.
   *
   * @param datasetPublicId the public ID of the dataset to run
   * @param request the validated {@link RunRequest}
   * @param username the username of the authenticated user triggering the run
   * @return the created {@link RunResponse}
   */
  RunResponse triggerRun(UUID datasetPublicId, @Valid RunRequest request, String username);

  /**
   * Retrieves a run by public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.run.entity.Run}
   * @return the matching {@link RunResponse}
   */
  RunResponse getRun(UUID publicId);

  /**
   * Retrieves run history for a dataset.
   *
   * @param datasetPublicId the public ID of the dataset
   * @param pageable pagination information
   * @return a paginated {@link RunResponse}
   */
  Page<RunResponse> getRunsByDataset(UUID datasetPublicId, Pageable pageable);
}

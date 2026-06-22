package vn.vinfast.aitesthub.experiment.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.experiment.request.CreateExperimentRequest;
import vn.vinfast.aitesthub.experiment.response.ExperimentResponse;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Validated
public interface ExperimentService {

  /**
   * Creates a draft experiment in a project.
   *
   * @param projectId public UUID of the owning project
   * @param request validated experiment draft payload
   * @param username username of the authenticated creator
   * @return created experiment response
   */
  ExperimentResponse create(UUID projectId, @Valid CreateExperimentRequest request, String username);

  /**
   * Lists experiments for a project.
   *
   * @param projectId public UUID of the owning project
   * @param pageable pagination information
   * @return paginated experiment responses
   */
  Page<ExperimentResponse> listByProject(UUID projectId, Pageable pageable);

  /**
   * Retrieves an experiment by public UUID.
   *
   * @param experimentId public UUID of the experiment
   * @return experiment response
   */
  ExperimentResponse get(UUID experimentId);

  /**
   * Starts a draft experiment by triggering one run per variant.
   *
   * @param experimentId public UUID of the experiment
   * @param username username of the authenticated starter
   * @return updated experiment response
   */
  ExperimentResponse start(UUID experimentId, String username);

  /**
   * Compares the first two completed variant runs in an experiment.
   *
   * @param experimentId public UUID of the experiment
   * @return run comparison response for the first two variants
   */
  RunComparisonResponse compare(UUID experimentId);
}

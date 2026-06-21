package vn.vinfast.aitesthub.dataset.service;

import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@Validated
public interface DatasetService {

  /**
   * Creates a dataset inside a project.
   *
   * @param projectPublicId the public ID of the owning {@link vn.vinfast.aitesthub.project.entity.Project}
   * @param request the validated {@link CreateDatasetRequest}
   * @param username the username of the authenticated user creating the dataset
   * @return the created {@link DatasetResponse}
   */
  DatasetResponse createDataset(UUID projectPublicId, @Valid CreateDatasetRequest request, String username);

  /**
   * Retrieves a dataset by its public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @return the matching {@link DatasetResponse}
   */
  DatasetResponse getDataset(UUID publicId);

  /**
   * Retrieves active datasets for a project.
   *
   * @param projectPublicId the public ID of the owning {@link vn.vinfast.aitesthub.project.entity.Project}
   * @param pageable pagination information
   * @return a paginated {@link DatasetResponse}
   */
  Page<DatasetResponse> getDatasetsByProject(UUID projectPublicId, Pageable pageable);

  /**
   * Updates a dataset by its public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @param request the validated {@link UpdateDatasetRequest}
   * @param username the username of the authenticated user updating the dataset
   * @return the updated {@link DatasetResponse}
   */
  DatasetResponse updateDataset(UUID publicId, @Valid UpdateDatasetRequest request, String username);

  /**
   * Archives a dataset by its public ID.
   *
   * @param publicId the public ID of the {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @param username the username of the authenticated user archiving the dataset
   */
  void archiveDataset(UUID publicId, String username);
}

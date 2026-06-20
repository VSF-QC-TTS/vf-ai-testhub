package vn.vinfast.aitesthub.dataset.service;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
public interface DatasetService {

  DatasetResponse createDataset(UUID projectPublicId, CreateDatasetRequest request, String username);

  DatasetResponse getDataset(UUID publicId);

  Page<DatasetResponse> getDatasetsByProject(UUID projectPublicId, Pageable pageable);

  DatasetResponse updateDataset(UUID publicId, UpdateDatasetRequest request, String username);

  void archiveDataset(UUID publicId, String username);
}

package vn.vinfast.aitesthub.dataset.service.impl;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.mapper.DatasetMapper;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;
import vn.vinfast.aitesthub.dataset.service.DatasetService;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DatasetServiceImpl implements DatasetService {

  private final DatasetRepository datasetRepository;
  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;
  private final DatasetMapper datasetMapper;

  @Override
  @Transactional
  public DatasetResponse createDataset(UUID projectPublicId, CreateDatasetRequest request, String username) {
    Project project = projectRepository.findByPublicId(projectPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));

    if (project.isArchived()) {
      throw new ResourceException("Cannot add dataset to an archived project", ErrorCode.VALIDATION_ERROR.getStatus(), "PROJECT_ARCHIVED");
    }

    User currentUser = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));

    if (datasetRepository.findByProjectAndName(project, request.name()).isPresent()) {
      throw new ResourceException("Dataset name must be unique within a project", ErrorCode.VALIDATION_ERROR.getStatus(), "DATASET_NAME_EXISTS");
    }

    Dataset dataset = datasetMapper.toEntity(request);
    dataset.setProject(project);
    dataset.setCreatedBy(currentUser);

    dataset = datasetRepository.save(dataset);
    return datasetMapper.toResponse(dataset);
  }

  @Override
  public DatasetResponse getDataset(UUID publicId) {
    return datasetRepository.findByPublicId(publicId)
        .map(datasetMapper::toResponse)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
  }

  @Override
  public Page<DatasetResponse> getDatasetsByProject(UUID projectPublicId, Pageable pageable) {
    Project project = projectRepository.findByPublicId(projectPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));
        
    return datasetRepository.findByProjectAndArchivedFalse(project, pageable)
        .map(datasetMapper::toResponse);
  }

  @Override
  @Transactional
  public DatasetResponse updateDataset(UUID publicId, UpdateDatasetRequest request, String username) {
    Dataset dataset = datasetRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));

    if (dataset.isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
    
    if (dataset.getProject().isArchived()) {
      throw new ResourceException("Cannot update dataset in an archived project", ErrorCode.VALIDATION_ERROR.getStatus(), "PROJECT_ARCHIVED");
    }

    // Check name uniqueness if name changed
    if (!dataset.getName().equals(request.name())) {
      if (datasetRepository.findByProjectAndName(dataset.getProject(), request.name()).isPresent()) {
        throw new ResourceException("Dataset name must be unique within a project", ErrorCode.VALIDATION_ERROR.getStatus(), "DATASET_NAME_EXISTS");
      }
    }

    datasetMapper.updateEntity(request, dataset);
    return datasetMapper.toResponse(dataset);
  }

  @Override
  @Transactional
  public void archiveDataset(UUID publicId, String username) {
    Dataset dataset = datasetRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));

    if (!dataset.isArchived()) {
      dataset.setArchived(true);
    }
  }
}

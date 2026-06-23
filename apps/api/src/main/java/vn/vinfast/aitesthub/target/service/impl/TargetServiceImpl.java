package vn.vinfast.aitesthub.target.service.impl;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.BusinessException;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.mapper.ResponseMappingMapper;
import vn.vinfast.aitesthub.target.mapper.TargetMapper;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;
import vn.vinfast.aitesthub.target.service.TargetSecretService;
import vn.vinfast.aitesthub.target.service.TargetService;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TargetServiceImpl implements TargetService {

  private static final List<RunStatus> ACTIVE_RUN_STATUSES = List.of(RunStatus.PENDING, RunStatus.RUNNING);

  private final TargetRepository targetRepository;
  private final ProjectRepository projectRepository;
  private final RunRepository runRepository;
  private final TargetMapper targetMapper;
  private final ResponseMappingMapper responseMappingMapper;
  private final TargetSecretService targetSecretService;

  @Override
  @Transactional(readOnly = true)
  public Page<TargetResponse> getTargets(UUID projectId, Pageable pageable) {
    if (projectRepository.findByPublicId(projectId).isEmpty()) {
      throw new ResourceException(ErrorCode.PROJECT_NOT_FOUND);
    }
    return targetRepository.findByProjectPublicId(projectId, pageable).map(targetMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public TargetResponse getTarget(UUID targetId) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));
    return targetMapper.toResponse(target);
  }

  @Override
  @Transactional
  public TargetResponse createTarget(TargetRequest request) {
    Project project = projectRepository.findByPublicId(request.projectId())
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));

    if (targetRepository.existsByProjectPublicIdAndName(request.projectId(), request.name())) {
      throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Target name already exists in this project.");
    }

    Target target = targetMapper.toEntity(request);
    target.setProject(project);

    // Prevent storing secrets in plaintext DB column
    Map<String, String> secretValues = extractSecrets(request.authConfig());
    target.setAuthConfig(null);

    // Handle inline ResponseMapping from request
    if (request.responseMapping() != null) {
      ResponseMapping mapping = responseMappingMapper.toEntity(request.responseMapping());
      mapping.setTarget(target);
      target.setResponseMapping(mapping);
    }

    Target saved = targetRepository.save(target);
    targetSecretService.saveSecrets(saved, secretValues);

    return targetMapper.toResponse(saved);
  }

  @Override
  @Transactional
  public TargetResponse updateTarget(UUID targetId, TargetRequest request) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));

    // Validate that request projectId matches the existing target's project to prevent confusion.
    if (!target.getProject().getPublicId().equals(request.projectId())) {
      throw new BusinessException(ErrorCode.VALIDATION_ERROR,
          "Request projectId does not match the target's owning project.");
    }

    if (targetRepository.existsByProjectPublicIdAndNameAndPublicIdNot(target.getProject().getPublicId(), request.name(), targetId)) {
      throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Target name already exists in this project.");
    }

    targetMapper.updateEntityFromRequest(request, target);
    
    // Prevent storing secrets in plaintext DB column
    Map<String, String> secretValues = extractSecrets(request.authConfig());
    target.setAuthConfig(null);
    
    Target updated = targetRepository.save(target);
    targetSecretService.saveSecrets(updated, secretValues);

    return targetMapper.toResponse(updated);
  }

  @Override
  @Transactional
  public void deleteTarget(UUID targetId) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));

    // Prevent deletion when there are active or pending runs referencing this target.
    if (runRepository.existsByTargetAndStatusIn(target, ACTIVE_RUN_STATUSES)) {
      throw new BusinessException(ErrorCode.TARGET_HAS_ACTIVE_RUNS);
    }

    targetRepository.delete(target);
  }

  private java.util.Map<String, String> extractSecrets(java.util.Map<String, Object> authConfig) {
    if (authConfig == null || authConfig.isEmpty()) {
      return java.util.Map.of();
    }
    java.util.Map<String, String> secrets = new java.util.HashMap<>();
    authConfig.forEach((k, v) -> {
      if (v != null) {
        secrets.put(k, v.toString());
      }
    });
    return secrets;
  }
}

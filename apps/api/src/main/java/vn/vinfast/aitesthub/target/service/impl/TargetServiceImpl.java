package vn.vinfast.aitesthub.target.service.impl;

import java.util.List;
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

    // Handle inline ResponseMapping from request — mapper ignores it to prevent orphan
    // entity creation without the required target back-reference.
    if (request.responseMapping() != null) {
      ResponseMapping mapping = responseMappingMapper.toEntity(request.responseMapping());
      mapping.setTarget(target);
      target.setResponseMapping(mapping);
    }

    Target saved = targetRepository.save(target);
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
    Target updated = targetRepository.save(target);
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
}

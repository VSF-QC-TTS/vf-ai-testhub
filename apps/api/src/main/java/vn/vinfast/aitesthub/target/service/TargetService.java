package vn.vinfast.aitesthub.target.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.mapper.TargetMapper;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TargetService {

  private final TargetRepository targetRepository;
  private final ProjectRepository projectRepository;
  private final TargetMapper targetMapper;
  private final CurlParserService curlParserService;

  @Transactional(readOnly = true)
  public Page<TargetResponse> getTargets(UUID projectId, Pageable pageable) {
    if (projectRepository.findByPublicId(projectId).isEmpty()) {
      throw new ResourceException(ErrorCode.PROJECT_NOT_FOUND);
    }
    return targetRepository.findByProjectPublicId(projectId, pageable).map(targetMapper::toResponse);
  }

  @Transactional(readOnly = true)
  public TargetResponse getTarget(UUID targetId) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));
    return targetMapper.toResponse(target);
  }

  @Transactional
  public TargetResponse createTarget(TargetRequest request) {
    Project project = projectRepository.findByPublicId(request.projectId())
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));

    Target target = targetMapper.toEntity(request);
    target.setProject(project);

    Target saved = targetRepository.save(target);
    return targetMapper.toResponse(saved);
  }

  @Transactional
  public TargetResponse updateTarget(UUID targetId, TargetRequest request) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));

    targetMapper.updateEntityFromRequest(request, target);
    Target updated = targetRepository.save(target);
    return targetMapper.toResponse(updated);
  }

  @Transactional
  public void deleteTarget(UUID targetId) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));
    targetRepository.delete(target);
  }
}

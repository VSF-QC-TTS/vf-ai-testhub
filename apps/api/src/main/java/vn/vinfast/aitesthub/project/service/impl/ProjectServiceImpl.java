package vn.vinfast.aitesthub.project.service.impl;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.mapper.ProjectMapper;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.project.request.ProjectRequest;
import vn.vinfast.aitesthub.project.response.ProjectResponse;
import vn.vinfast.aitesthub.project.service.ProjectService;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;
  private final ProjectMapper projectMapper;

  @Override
  @Transactional
  public ProjectResponse create(ProjectRequest request, String ownerUsername) {
    if (projectRepository.existsByName(request.name())) {
      throw new ResourceException(ErrorCode.PROJECT_ALREADY_EXISTS);
    }
    User owner = userRepository.findByUsername(ownerUsername)
        .orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));

    Project project = Project.builder()
        .name(request.name())
        .description(request.description())
        .owner(owner)
        .createdBy(owner)
        .build();

    Project savedProject = projectRepository.save(project);
    return projectMapper.toResponse(savedProject);
  }

  @Override
  public ProjectResponse findById(UUID id) {
    Project project = projectRepository.findByPublicId(id)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));
    return projectMapper.toResponse(project);
  }

  @Override
  public Page<ProjectResponse> findAll(Pageable pageable) {
    return projectRepository.findByArchivedFalse(pageable)
        .map(projectMapper::toResponse);
  }

  @Override
  @Transactional
  public ProjectResponse update(UUID id, ProjectRequest request) {
    Project project = projectRepository.findByPublicId(id)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));

    if (projectRepository.existsByNameAndIdNot(request.name(), project.getId())) {
      throw new ResourceException(ErrorCode.PROJECT_ALREADY_EXISTS);
    }

    project.setName(request.name());
    project.setDescription(request.description());

    Project updatedProject = projectRepository.save(project);
    return projectMapper.toResponse(updatedProject);
  }

  @Override
  @Transactional
  public void archive(UUID id) {
    Project project = projectRepository.findByPublicId(id)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));
    project.setArchived(true);
    projectRepository.save(project);
  }
}

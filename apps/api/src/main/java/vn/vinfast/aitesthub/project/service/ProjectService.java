package vn.vinfast.aitesthub.project.service;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.vinfast.aitesthub.project.request.ProjectRequest;
import vn.vinfast.aitesthub.project.response.ProjectResponse;

public interface ProjectService {

  ProjectResponse create(ProjectRequest request, String ownerUsername);

  ProjectResponse findById(UUID id);

  Page<ProjectResponse> findAll(Pageable pageable);

  ProjectResponse update(UUID id, ProjectRequest request);

  void archive(UUID id);
}

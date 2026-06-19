package vn.vinfast.aitesthub.project.service.impl;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */


import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.mapper.ProjectMapper;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.project.request.ProjectRequest;
import vn.vinfast.aitesthub.project.response.ProjectResponse;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

  @Mock private ProjectRepository projectRepository;
  @Mock private UserRepository userRepository;
  @Mock private ProjectMapper projectMapper;

  @InjectMocks private ProjectServiceImpl projectService;

  @Test
  void create_Success() {
    ProjectRequest request = new ProjectRequest("My Project", "Desc");
    User user = new User();
    user.setId(1L);
    
    when(projectRepository.existsByName(request.name())).thenReturn(false);
    when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user));
    
    Project project = new Project();
    project.setId(1L);
    project.setPublicId(UUID.randomUUID());
    when(projectRepository.save(any(Project.class))).thenReturn(project);
    
    ProjectResponse response = new ProjectResponse(project.getPublicId(), "My Project", "Desc", null, null, false, null, null);
    when(projectMapper.toResponse(project)).thenReturn(response);
    
    ProjectResponse result = projectService.create(request, "user1");
    
    assertThat(result.name()).isEqualTo("My Project");
    verify(projectRepository).save(any(Project.class));
  }

  @Test
  void findById_NotFound_ThrowsException() {
    UUID id = UUID.randomUUID();
    when(projectRepository.findByPublicId(id)).thenReturn(Optional.empty());
    
    ResourceException ex = assertThrows(ResourceException.class, () -> projectService.findById(id));
    assertThat(ex.getResponse().code()).isEqualTo(ErrorCode.PROJECT_NOT_FOUND.getCode());
  }
}

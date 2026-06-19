package vn.vinfast.aitesthub.project.mapper;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.response.ProjectResponse;
import vn.vinfast.aitesthub.user.mapper.UserMapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProjectMapper {

  @Mapping(source = "publicId", target = "id")
  ProjectResponse toResponse(Project project);
}

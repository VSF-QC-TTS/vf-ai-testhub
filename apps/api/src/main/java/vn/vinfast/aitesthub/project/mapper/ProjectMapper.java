package vn.vinfast.aitesthub.project.mapper;

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

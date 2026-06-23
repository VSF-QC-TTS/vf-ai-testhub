package vn.vinfast.aitesthub.target.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetResponse;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Mapper(componentModel = "spring", uses = {ResponseMappingMapper.class})
public interface TargetMapper {

  @Mapping(source = "project.publicId", target = "projectId")
  @Mapping(source = "default", target = "isDefault")
  TargetResponse toResponse(Target target);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "isDefault", source = "isDefault")
  @Mapping(target = "responseMapping", ignore = true)
  Target toEntity(TargetRequest request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "default", source = "isDefault")
  void updateEntityFromRequest(TargetRequest request, @MappingTarget Target target);
}

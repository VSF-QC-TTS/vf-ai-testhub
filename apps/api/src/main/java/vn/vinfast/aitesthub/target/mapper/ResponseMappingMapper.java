package vn.vinfast.aitesthub.target.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.request.ResponseMappingRequest;
import vn.vinfast.aitesthub.target.response.ResponseMappingResponse;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Mapper(componentModel = "spring")
public interface ResponseMappingMapper {

  ResponseMappingResponse toResponse(ResponseMapping responseMapping);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "target", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  ResponseMapping toEntity(ResponseMappingRequest request);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "target", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntityFromRequest(ResponseMappingRequest request, @MappingTarget ResponseMapping responseMapping);
}

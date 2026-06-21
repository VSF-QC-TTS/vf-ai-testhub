package vn.vinfast.aitesthub.rubric.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.rubric.request.CreateRubricRequest;
import vn.vinfast.aitesthub.rubric.request.UpdateRubricRequest;
import vn.vinfast.aitesthub.rubric.response.RubricResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface RubricMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "dataset", ignore = true)
  @Mapping(target = "createdBy", ignore = true)
  @Mapping(target = "archived", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  Rubric toEntity(CreateRubricRequest request);

  @Mapping(source = "project.publicId", target = "projectPublicId")
  @Mapping(source = "dataset.publicId", target = "datasetPublicId")
  @Mapping(source = "createdBy.publicId", target = "createdByPublicId")
  RubricResponse toResponse(Rubric entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "scope", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "dataset", ignore = true)
  @Mapping(target = "createdBy", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntity(UpdateRubricRequest request, @MappingTarget Rubric entity);
}

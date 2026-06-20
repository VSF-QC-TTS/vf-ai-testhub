package vn.vinfast.aitesthub.dataset.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.request.CreateDatasetRequest;
import vn.vinfast.aitesthub.dataset.request.UpdateDatasetRequest;
import vn.vinfast.aitesthub.dataset.response.DatasetResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@Mapper(componentModel = "spring")
public interface DatasetMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "createdBy", ignore = true)
  @Mapping(target = "archived", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  Dataset toEntity(CreateDatasetRequest request);

  @Mapping(source = "project.publicId", target = "projectPublicId")
  DatasetResponse toResponse(Dataset entity);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "project", ignore = true)
  @Mapping(target = "createdBy", ignore = true)
  @Mapping(target = "archived", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntity(UpdateDatasetRequest request, @MappingTarget Dataset entity);
}

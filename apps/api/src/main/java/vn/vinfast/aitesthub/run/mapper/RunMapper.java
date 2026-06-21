package vn.vinfast.aitesthub.run.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.response.RunResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface RunMapper {

  @Mapping(source = "project.publicId", target = "projectPublicId")
  @Mapping(source = "dataset.publicId", target = "datasetPublicId")
  @Mapping(source = "target.publicId", target = "targetPublicId")
  @Mapping(source = "triggeredBy.publicId", target = "triggeredByPublicId")
  @Mapping(source = "previousRun.publicId", target = "previousRunPublicId")
  RunResponse toResponse(Run entity);
}

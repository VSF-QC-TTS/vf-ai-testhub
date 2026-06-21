package vn.vinfast.aitesthub.result.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.result.entity.ManualReview;
import vn.vinfast.aitesthub.result.response.ManualReviewResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Mapper(componentModel = "spring")
public interface ManualReviewMapper {

  @Mapping(source = "testResult.publicId", target = "testResultPublicId")
  @Mapping(source = "reviewedBy.publicId", target = "reviewedByPublicId")
  ManualReviewResponse toResponse(ManualReview entity);
}

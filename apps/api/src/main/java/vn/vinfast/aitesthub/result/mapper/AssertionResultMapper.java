package vn.vinfast.aitesthub.result.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.result.entity.AssertionResult;
import vn.vinfast.aitesthub.result.response.AssertionResultResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface AssertionResultMapper {

  @Mapping(source = "testResult.publicId", target = "testResultPublicId")
  @Mapping(source = "assertion.publicId", target = "assertionPublicId")
  AssertionResultResponse toResponse(AssertionResult entity);
}

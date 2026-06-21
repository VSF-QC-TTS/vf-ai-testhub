package vn.vinfast.aitesthub.result.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.result.entity.ToolExpectationResult;
import vn.vinfast.aitesthub.result.response.ToolExpectationResultResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface ToolExpectationResultMapper {

  @Mapping(source = "testResult.publicId", target = "testResultPublicId")
  @Mapping(source = "toolExpectation.publicId", target = "toolExpectationPublicId")
  ToolExpectationResultResponse toResponse(ToolExpectationResult entity);
}

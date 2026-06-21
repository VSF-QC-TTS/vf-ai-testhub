package vn.vinfast.aitesthub.toolexpectation.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.request.CreateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.request.UpdateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.response.ToolExpectationResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface ToolExpectationMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "testCase", ignore = true)
  @Mapping(target = "rubric", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  ToolExpectation toEntity(CreateToolExpectationRequest request);

  @Mapping(source = "testCase.publicId", target = "testCasePublicId")
  @Mapping(source = "rubric.publicId", target = "rubricPublicId")
  ToolExpectationResponse toResponse(ToolExpectation entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "testCase", ignore = true)
  @Mapping(target = "rubric", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntity(UpdateToolExpectationRequest request, @MappingTarget ToolExpectation entity);
}

package vn.vinfast.aitesthub.assertion.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.request.CreateAssertionRequest;
import vn.vinfast.aitesthub.assertion.request.UpdateAssertionRequest;
import vn.vinfast.aitesthub.assertion.response.AssertionResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface AssertionMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "testCase", ignore = true)
  @Mapping(target = "rubric", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  Assertion toEntity(CreateAssertionRequest request);

  @Mapping(source = "testCase.publicId", target = "testCasePublicId")
  @Mapping(source = "rubric.publicId", target = "rubricPublicId")
  AssertionResponse toResponse(Assertion entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "testCase", ignore = true)
  @Mapping(target = "rubric", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntity(UpdateAssertionRequest request, @MappingTarget Assertion entity);
}

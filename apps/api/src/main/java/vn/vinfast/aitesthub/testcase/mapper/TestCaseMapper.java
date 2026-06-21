package vn.vinfast.aitesthub.testcase.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.request.CreateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.request.UpdateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.response.TestCaseResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring")
public interface TestCaseMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "dataset", ignore = true)
  @Mapping(target = "source", ignore = true)
  @Mapping(target = "generatedBy", ignore = true)
  @Mapping(target = "generationPrompt", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  TestCase toEntity(CreateTestCaseRequest request);

  @Mapping(source = "dataset.publicId", target = "datasetPublicId")
  TestCaseResponse toResponse(TestCase entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "publicId", ignore = true)
  @Mapping(target = "dataset", ignore = true)
  @Mapping(target = "source", ignore = true)
  @Mapping(target = "generatedBy", ignore = true)
  @Mapping(target = "generationPrompt", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  void updateEntity(UpdateTestCaseRequest request, @MappingTarget TestCase entity);
}

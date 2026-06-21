package vn.vinfast.aitesthub.result.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.response.TestResultResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Mapper(componentModel = "spring", uses = {AssertionResultMapper.class, ToolExpectationResultMapper.class})
public interface TestResultMapper {

  @Mapping(source = "run.publicId", target = "runPublicId")
  @Mapping(source = "testCase.publicId", target = "testCasePublicId")
  @Mapping(target = "assertionResults", ignore = true)
  @Mapping(target = "toolExpectationResults", ignore = true)
  TestResultResponse toResponse(TestResult entity);
}

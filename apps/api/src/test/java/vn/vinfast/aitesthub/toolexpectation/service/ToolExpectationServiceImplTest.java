package vn.vinfast.aitesthub.toolexpectation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.rubric.repository.RubricRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;
import vn.vinfast.aitesthub.toolexpectation.mapper.ToolExpectationMapper;
import vn.vinfast.aitesthub.toolexpectation.repository.ToolExpectationRepository;
import vn.vinfast.aitesthub.toolexpectation.request.CreateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.request.UpdateToolExpectationRequest;
import vn.vinfast.aitesthub.toolexpectation.response.ToolExpectationResponse;
import vn.vinfast.aitesthub.toolexpectation.service.impl.ToolExpectationServiceImpl;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class ToolExpectationServiceImplTest {

  @Mock private ToolExpectationRepository toolExpectationRepository;
  @Mock private TestCaseRepository testCaseRepository;
  @Mock private RubricRepository rubricRepository;
  @Spy private ToolExpectationMapper toolExpectationMapper = Mappers.getMapper(ToolExpectationMapper.class);

  private ToolExpectationServiceImpl toolExpectationService;

  private final UUID testCasePublicId = UUID.randomUUID();
  private final String username = "qc@test.com";
  private TestCase testCase;

  @BeforeEach
  void setUp() {
    toolExpectationService =
        new ToolExpectationServiceImpl(
            toolExpectationRepository, testCaseRepository, rubricRepository, toolExpectationMapper);
    Project project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    Dataset dataset = Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).build();
    testCase = TestCase.builder().id(3L).publicId(testCasePublicId).dataset(dataset).input("Question").build();
  }

  @Test
  void createToolExpectation_toolMustBeCalled_success() {
    CreateToolExpectationRequest request =
        new CreateToolExpectationRequest(
            ToolExpectationType.TOOL_MUST_BE_CALLED,
            null,
            "search_product",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));
    when(toolExpectationRepository.save(any(ToolExpectation.class)))
        .thenAnswer(
            invocation -> {
              ToolExpectation expectation = invocation.getArgument(0);
              expectation.setId(10L);
              expectation.setPublicId(UUID.randomUUID());
              return expectation;
            });

    ToolExpectationResponse response =
        toolExpectationService.createToolExpectation(testCasePublicId, request, username);

    assertThat(response.expectationType()).isEqualTo(ToolExpectationType.TOOL_MUST_BE_CALLED);
    assertThat(response.targetSource()).isEqualTo(TargetSourceType.normalized_tool_calls);
    assertThat(response.required()).isTrue();

    ArgumentCaptor<ToolExpectation> captor = ArgumentCaptor.forClass(ToolExpectation.class);
    verify(toolExpectationRepository).save(captor.capture());
    assertThat(captor.getValue().getTestCase()).isEqualTo(testCase);
  }

  @Test
  void createToolExpectation_missingToolName_throwsException() {
    CreateToolExpectationRequest request =
        new CreateToolExpectationRequest(
            ToolExpectationType.TOOL_MUST_BE_CALLED, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    assertThatThrownBy(() -> toolExpectationService.createToolExpectation(testCasePublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "TOOL_EXPECTATION_TOOL_REQUIRED");
  }

  @Test
  void createToolExpectation_sequenceMissing_throwsException() {
    CreateToolExpectationRequest request =
        new CreateToolExpectationRequest(
            ToolExpectationType.TOOL_SEQUENCE_MATCH, null, null, null, null, List.of(), null, null, null, null, null, null, null, null, null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    assertThatThrownBy(() -> toolExpectationService.createToolExpectation(testCasePublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "TOOL_EXPECTATION_SEQUENCE_REQUIRED");
  }

  @Test
  void createToolExpectation_invalidCallCount_throwsException() {
    CreateToolExpectationRequest request =
        new CreateToolExpectationRequest(
            ToolExpectationType.TOOL_CALL_COUNT, null, "search_product", null, null, null, 3, 1, null, null, null, null, null, null, null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    assertThatThrownBy(() -> toolExpectationService.createToolExpectation(testCasePublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "TOOL_EXPECTATION_CALL_COUNT_INVALID");
  }

  @Test
  void updateToolExpectation_argsMatchWithoutAssertions_throwsException() {
    UUID expectationPublicId = UUID.randomUUID();
    ToolExpectation expectation =
        ToolExpectation.builder()
            .publicId(expectationPublicId)
            .testCase(testCase)
            .expectationType(ToolExpectationType.TOOL_MUST_BE_CALLED)
            .toolName("search_product")
            .build();
    UpdateToolExpectationRequest request =
        new UpdateToolExpectationRequest(
            ToolExpectationType.TOOL_ARGS_MATCH, null, "search_product", null, List.of(), null, null, null, null, null, null, null, null, null, null);

    when(toolExpectationRepository.findByPublicId(expectationPublicId)).thenReturn(Optional.of(expectation));

    assertThatThrownBy(() -> toolExpectationService.updateToolExpectation(expectationPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "TOOL_EXPECTATION_ARGUMENTS_REQUIRED");
  }

  @Test
  void deleteToolExpectation_success() {
    UUID expectationPublicId = UUID.randomUUID();
    ToolExpectation expectation =
        ToolExpectation.builder()
            .publicId(expectationPublicId)
            .testCase(testCase)
            .expectationType(ToolExpectationType.TOOL_ARGS_MATCH)
            .toolName("search_product")
            .argumentAssertions(List.of(Map.of("argumentPath", "query", "type", "contains")))
            .build();

    when(toolExpectationRepository.findByPublicId(expectationPublicId)).thenReturn(Optional.of(expectation));

    toolExpectationService.deleteToolExpectation(expectationPublicId, username);

    verify(toolExpectationRepository).delete(expectation);
  }
}

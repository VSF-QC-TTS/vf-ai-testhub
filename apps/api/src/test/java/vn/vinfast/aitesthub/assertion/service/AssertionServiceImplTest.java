package vn.vinfast.aitesthub.assertion.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.assertion.mapper.AssertionMapper;
import vn.vinfast.aitesthub.assertion.repository.AssertionRepository;
import vn.vinfast.aitesthub.assertion.request.CreateAssertionRequest;
import vn.vinfast.aitesthub.assertion.request.UpdateAssertionRequest;
import vn.vinfast.aitesthub.assertion.response.AssertionResponse;
import vn.vinfast.aitesthub.assertion.service.impl.AssertionServiceImpl;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.rubric.repository.RubricRepository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class AssertionServiceImplTest {

  @Mock private AssertionRepository assertionRepository;
  @Mock private TestCaseRepository testCaseRepository;
  @Mock private RubricRepository rubricRepository;
  @Spy private AssertionMapper assertionMapper = Mappers.getMapper(AssertionMapper.class);

  private AssertionServiceImpl assertionService;

  private final UUID testCasePublicId = UUID.randomUUID();
  private final String username = "qc@test.com";
  private TestCase testCase;

  @BeforeEach
  void setUp() {
    assertionService =
        new AssertionServiceImpl(
            assertionRepository, testCaseRepository, rubricRepository, assertionMapper);
    Project project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    Dataset dataset = Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).build();
    testCase = TestCase.builder().id(3L).publicId(testCasePublicId).dataset(dataset).input("Question").build();
  }

  @Test
  void createAssertion_fieldContains_success() {
    CreateAssertionRequest request =
        new CreateAssertionRequest(
            AssertionScope.FIELD,
            AssertionType.contains,
            null,
            "$.answer",
            null,
            "VF 8",
            null,
            null,
            null,
            null,
            SeverityLevel.CRITICAL,
            null,
            null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));
    when(assertionRepository.save(any(Assertion.class)))
        .thenAnswer(
            invocation -> {
              Assertion assertion = invocation.getArgument(0);
              assertion.setId(10L);
              assertion.setPublicId(UUID.randomUUID());
              return assertion;
            });

    AssertionResponse response = assertionService.createAssertion(testCasePublicId, request, username);

    assertThat(response.type()).isEqualTo(AssertionType.contains);
    assertThat(response.fieldPath()).isEqualTo("$.answer");
    assertThat(response.enabled()).isTrue();
    assertThat(response.weight()).isEqualByComparingTo("1.0");

    ArgumentCaptor<Assertion> captor = ArgumentCaptor.forClass(Assertion.class);
    verify(assertionRepository).save(captor.capture());
    assertThat(captor.getValue().getTestCase()).isEqualTo(testCase);
  }

  @Test
  void createAssertion_fieldMissingPath_throwsException() {
    CreateAssertionRequest request =
        new CreateAssertionRequest(
            AssertionScope.FIELD, AssertionType.contains, null, null, null, "VF 8", null, null, null, null, null, null, null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    assertThatThrownBy(() -> assertionService.createAssertion(testCasePublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "ASSERTION_FIELD_PATH_REQUIRED");
  }

  @Test
  void createAssertion_llmRubricWithoutRubricOrOverride_throwsException() {
    CreateAssertionRequest request =
        new CreateAssertionRequest(
            AssertionScope.WHOLE_RESPONSE, AssertionType.llm_rubric, null, null, null, null, null, null, null, null, null, null, null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    assertThatThrownBy(() -> assertionService.createAssertion(testCasePublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "ASSERTION_RUBRIC_REQUIRED");
  }

  @Test
  void updateAssertion_archivedDataset_throwsException() {
    UUID assertionPublicId = UUID.randomUUID();
    testCase.getDataset().setArchived(true);
    Assertion assertion =
        Assertion.builder()
            .publicId(assertionPublicId)
            .testCase(testCase)
            .scope(AssertionScope.FIELD)
            .type(AssertionType.contains)
            .fieldPath("$.answer")
            .expectedValue("VF 8")
            .build();
    UpdateAssertionRequest request =
        new UpdateAssertionRequest(null, null, null, null, null, "VF 9", null, null, null, null, null, null, null);

    when(assertionRepository.findByPublicId(assertionPublicId)).thenReturn(Optional.of(assertion));

    assertThatThrownBy(() -> assertionService.updateAssertion(assertionPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.DATASET_ARCHIVED.getCode());
  }

  @Test
  void deleteAssertion_success() {
    UUID assertionPublicId = UUID.randomUUID();
    Assertion assertion =
        Assertion.builder()
            .publicId(assertionPublicId)
            .testCase(testCase)
            .scope(AssertionScope.FIELD)
            .type(AssertionType.contains)
            .fieldPath("$.answer")
            .expectedValue("VF 8")
            .build();

    when(assertionRepository.findByPublicId(assertionPublicId)).thenReturn(Optional.of(assertion));

    assertionService.deleteAssertion(assertionPublicId, username);

    verify(assertionRepository).delete(assertion);
  }
}

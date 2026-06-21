package vn.vinfast.aitesthub.testcase.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;
import vn.vinfast.aitesthub.testcase.mapper.TestCaseMapper;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.testcase.request.CreateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.request.TestCaseFilter;
import vn.vinfast.aitesthub.testcase.request.UpdateTestCaseRequest;
import vn.vinfast.aitesthub.testcase.response.TestCaseResponse;
import vn.vinfast.aitesthub.testcase.service.impl.TestCaseServiceImpl;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class TestCaseServiceImplTest {

  @Mock private TestCaseRepository testCaseRepository;
  @Mock private DatasetRepository datasetRepository;
  @Spy private TestCaseMapper testCaseMapper = Mappers.getMapper(TestCaseMapper.class);

  private TestCaseServiceImpl testCaseService;

  private final UUID datasetPublicId = UUID.randomUUID();
  private final String username = "qc@test.com";
  private Dataset dataset;

  @BeforeEach
  void setUp() {
    testCaseService = new TestCaseServiceImpl(testCaseRepository, datasetRepository, testCaseMapper);
    dataset = Dataset.builder().id(1L).publicId(datasetPublicId).name("Regression").build();
  }

  @Test
  void createTestCase_success() {
    CreateTestCaseRequest request =
        new CreateTestCaseRequest(
            "TC001",
            "Auth",
            "Login happy path",
            null,
            "How do I log in?",
            "Bot explains login steps",
            null,
            null,
            null,
            List.of("auth"),
            TestPriority.P1,
            null,
            null);

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(testCaseRepository.save(any(TestCase.class)))
        .thenAnswer(
            invocation -> {
              TestCase testCase = invocation.getArgument(0);
              testCase.setId(10L);
              testCase.setPublicId(UUID.randomUUID());
              return testCase;
            });

    TestCaseResponse response = testCaseService.createTestCase(datasetPublicId, request, username);

    assertThat(response.input()).isEqualTo("How do I log in?");
    assertThat(response.datasetPublicId()).isEqualTo(datasetPublicId);
    assertThat(response.priority()).isEqualTo(TestPriority.P1);
    assertThat(response.enabled()).isTrue();
    assertThat(response.source()).isEqualTo(TestCaseSource.MANUAL);

    ArgumentCaptor<TestCase> captor = ArgumentCaptor.forClass(TestCase.class);
    verify(testCaseRepository).save(captor.capture());
    assertThat(captor.getValue().getDataset()).isEqualTo(dataset);
  }

  @Test
  void createTestCase_datasetNotFound_throwsException() {
    CreateTestCaseRequest request =
        new CreateTestCaseRequest(null, null, null, null, "Question", null, null, null, null, null, null, null, null);

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> testCaseService.createTestCase(datasetPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.DATASET_NOT_FOUND.getCode());
  }

  @Test
  void createTestCase_archivedDataset_throwsException() {
    CreateTestCaseRequest request =
        new CreateTestCaseRequest(null, null, null, null, "Question", null, null, null, null, null, null, null, null);
    dataset.setArchived(true);

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));

    assertThatThrownBy(() -> testCaseService.createTestCase(datasetPublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.DATASET_ARCHIVED.getCode());
  }

  @Test
  void getTestCases_delegatesToRepositorySpecification() {
    TestCase testCase =
        TestCase.builder()
            .publicId(UUID.randomUUID())
            .dataset(dataset)
            .input("Question")
            .priority(TestPriority.P2)
            .source(TestCaseSource.MANUAL)
            .enabled(true)
            .build();
    var pageable = PageRequest.of(0, 20);
    TestCaseFilter filter = new TestCaseFilter("Auth", TestPriority.P2, true, TestCaseSource.MANUAL, "auth", "question");

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(testCaseRepository.findAll(any(Specification.class), any(PageRequest.class)))
        .thenReturn(new PageImpl<>(List.of(testCase), pageable, 1));

    var response = testCaseService.getTestCases(datasetPublicId, filter, pageable);

    assertThat(response.getTotalElements()).isEqualTo(1);
    assertThat(response.getContent().getFirst().input()).isEqualTo("Question");
  }

  @Test
  void updateTestCase_blankInput_throwsException() {
    UUID testCasePublicId = UUID.randomUUID();
    TestCase testCase = TestCase.builder().publicId(testCasePublicId).dataset(dataset).input("Old").build();
    UpdateTestCaseRequest request =
        new UpdateTestCaseRequest(null, null, null, null, " ", null, null, null, null, null, null, null, null);

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    assertThatThrownBy(() -> testCaseService.updateTestCase(testCasePublicId, request, username))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", ErrorCode.VALIDATION_ERROR.getCode());
  }

  @Test
  void deleteTestCase_success() {
    UUID testCasePublicId = UUID.randomUUID();
    TestCase testCase = TestCase.builder().publicId(testCasePublicId).dataset(dataset).input("Question").build();

    when(testCaseRepository.findByPublicId(testCasePublicId)).thenReturn(Optional.of(testCase));

    testCaseService.deleteTestCase(testCasePublicId, username);

    verify(testCaseRepository).delete(testCase);
  }
}

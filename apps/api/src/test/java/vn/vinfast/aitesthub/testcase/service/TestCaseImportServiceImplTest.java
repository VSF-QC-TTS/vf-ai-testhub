package vn.vinfast.aitesthub.testcase.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mock.web.MockMultipartFile;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.storage.model.StorageResource;
import vn.vinfast.aitesthub.storage.model.StoreObjectCommand;
import vn.vinfast.aitesthub.storage.service.ObjectStorageService;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.entity.TestCaseImportPreview;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.importer.CsvTestCaseImportStrategy;
import vn.vinfast.aitesthub.testcase.repository.TestCaseImportPreviewRepository;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.testcase.request.ConfirmTestCaseImportRequest;
import vn.vinfast.aitesthub.testcase.service.impl.TestCaseImportServiceImpl;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@ExtendWith(MockitoExtension.class)
class TestCaseImportServiceImplTest {

  @Mock private DatasetRepository datasetRepository;
  @Mock private TestCaseRepository testCaseRepository;
  @Mock private TestCaseImportPreviewRepository previewRepository;
  @Mock private ObjectStorageService objectStorageService;

  private TestCaseImportServiceImpl importService;
  private Dataset dataset;
  private final UUID datasetPublicId = UUID.randomUUID();
  private final String csv =
      "id,section_name,custom_nlp_sample,custom_nlp_expected_dialog\n"
          + "TC001,Auth,How do I log in?,Bot explains login\n"
          + "TC002,Auth,How do I reset password?,Bot explains reset";

  @BeforeEach
  void setUp() {
    dataset = Dataset.builder().id(1L).publicId(datasetPublicId).name("Regression").build();
    importService =
        new TestCaseImportServiceImpl(
            datasetRepository,
            testCaseRepository,
            previewRepository,
            objectStorageService,
            List.of(new CsvTestCaseImportStrategy()));
  }

  @Test
  void previewImport_detectsMappingAndDuplicates() {
    MockMultipartFile file =
        new MockMultipartFile("file", "cases.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));
    TestCase existing = TestCase.builder().dataset(dataset).externalId("TC001").input("old").build();

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(testCaseRepository.findByDatasetAndExternalIdIn(dataset, List.of("TC001", "TC002")))
        .thenReturn(List.of(existing));
    when(previewRepository.save(any(TestCaseImportPreview.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    var response = importService.previewImport(datasetPublicId, file, "qc@test.com");

    assertThat(response.totalRows()).isEqualTo(2);
    assertThat(response.suggestedMapping()).containsEntry("custom_nlp_sample", "input");
    assertThat(response.duplicateExternalIds()).containsExactly("TC001");
    assertThat(response.sampleRows()).hasSize(2);
    verify(objectStorageService).store(any(StoreObjectCommand.class));
  }

  @Test
  void confirmImport_skipDuplicates_importsValidRows() {
    UUID previewId = UUID.randomUUID();
    TestCaseImportPreview preview =
        TestCaseImportPreview.builder()
            .publicId(previewId)
            .dataset(dataset)
            .fileName("cases.csv")
            .storageKey("imports/cases.csv")
            .suggestedMapping(
                Map.of(
                    "id", "externalId",
                    "section_name", "sectionName",
                    "custom_nlp_sample", "input",
                    "custom_nlp_expected_dialog", "expectedBehavior"))
            .expiresAt(OffsetDateTime.now().plusMinutes(10))
            .build();
    TestCase existing = TestCase.builder().dataset(dataset).externalId("TC001").input("old").build();
    ConfirmTestCaseImportRequest request =
        new ConfirmTestCaseImportRequest(previewId, null, true, List.of("imported"));

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(previewRepository.findByPublicId(previewId)).thenReturn(Optional.of(preview));
    when(objectStorageService.load("imports/cases.csv"))
        .thenReturn(new StorageResource("imports/cases.csv", new ByteArrayResource(csv.getBytes(StandardCharsets.UTF_8))));
    when(testCaseRepository.findByDatasetAndExternalIdIn(dataset, List.of("TC001", "TC002")))
        .thenReturn(List.of(existing));

    var response = importService.confirmImport(datasetPublicId, request, "qc@test.com");

    assertThat(response.importedCount()).isEqualTo(1);
    assertThat(response.skippedCount()).isEqualTo(1);
    assertThat(preview.isConfirmed()).isTrue();

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Iterable<TestCase>> captor = ArgumentCaptor.forClass(Iterable.class);
    verify(testCaseRepository).saveAll(captor.capture());
    TestCase imported = captor.getValue().iterator().next();
    assertThat(imported.getSource()).isEqualTo(TestCaseSource.IMPORTED);
    assertThat(imported.getInput()).isEqualTo("How do I reset password?");
    assertThat(imported.getTags()).containsExactly("imported");
  }

  @Test
  void confirmImport_missingInput_returnsRowError() {
    UUID previewId = UUID.randomUUID();
    String missingInputCsv =
        "id,section_name,custom_nlp_sample,custom_nlp_expected_dialog\n"
            + "TC001,Auth,,Bot explains login";
    TestCaseImportPreview preview =
        TestCaseImportPreview.builder()
            .publicId(previewId)
            .dataset(dataset)
            .fileName("cases.csv")
            .storageKey("imports/missing-input.csv")
            .suggestedMapping(
                Map.of(
                    "id", "externalId",
                    "section_name", "sectionName",
                    "custom_nlp_sample", "input",
                    "custom_nlp_expected_dialog", "expectedBehavior"))
            .expiresAt(OffsetDateTime.now().plusMinutes(10))
            .build();
    ConfirmTestCaseImportRequest request =
        new ConfirmTestCaseImportRequest(previewId, null, true, List.of("imported"));

    when(datasetRepository.findByPublicId(datasetPublicId)).thenReturn(Optional.of(dataset));
    when(previewRepository.findByPublicId(previewId)).thenReturn(Optional.of(preview));
    when(objectStorageService.load("imports/missing-input.csv"))
        .thenReturn(
            new StorageResource(
                "imports/missing-input.csv",
                new ByteArrayResource(missingInputCsv.getBytes(StandardCharsets.UTF_8))));
    when(testCaseRepository.findByDatasetAndExternalIdIn(dataset, List.of("TC001")))
        .thenReturn(List.of());

    var response = importService.confirmImport(datasetPublicId, request, "qc@test.com");

    assertThat(response.importedCount()).isZero();
    assertThat(response.errorCount()).isEqualTo(1);
    assertThat(response.errors().getFirst().reason()).isEqualTo("Missing required input");
  }
}

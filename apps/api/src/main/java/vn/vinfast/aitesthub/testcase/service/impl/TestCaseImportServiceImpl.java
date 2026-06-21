package vn.vinfast.aitesthub.testcase.service.impl;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.storage.model.StoreObjectCommand;
import vn.vinfast.aitesthub.storage.service.ObjectStorageService;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.testcase.entity.TestCaseImportPreview;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;
import vn.vinfast.aitesthub.testcase.importer.ParsedImportFile;
import vn.vinfast.aitesthub.testcase.importer.ParsedImportRow;
import vn.vinfast.aitesthub.testcase.importer.TestCaseImportStrategy;
import vn.vinfast.aitesthub.testcase.repository.TestCaseImportPreviewRepository;
import vn.vinfast.aitesthub.testcase.repository.TestCaseRepository;
import vn.vinfast.aitesthub.testcase.request.ConfirmTestCaseImportRequest;
import vn.vinfast.aitesthub.testcase.response.ImportConfirmResponse;
import vn.vinfast.aitesthub.testcase.response.ImportPreviewResponse;
import vn.vinfast.aitesthub.testcase.response.ImportRowError;
import vn.vinfast.aitesthub.testcase.response.ImportSampleRow;
import vn.vinfast.aitesthub.testcase.service.TestCaseImportService;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TestCaseImportServiceImpl implements TestCaseImportService {

  private static final int PREVIEW_SAMPLE_SIZE = 5;
  private static final int PREVIEW_EXPIRY_MINUTES = 30;
  private static final int IMPORT_BATCH_SIZE = 100;

  private final DatasetRepository datasetRepository;
  private final TestCaseRepository testCaseRepository;
  private final TestCaseImportPreviewRepository previewRepository;
  private final ObjectStorageService objectStorageService;
  private final List<TestCaseImportStrategy> importStrategies;

  @Override
  @Transactional
  public ImportPreviewResponse previewImport(UUID datasetPublicId, MultipartFile file, String username) {
    Dataset dataset = getActiveDataset(datasetPublicId);
    byte[] content = readFile(file);
    String fileName = file.getOriginalFilename() == null ? "test-cases" : file.getOriginalFilename();
    TestCaseImportStrategy strategy = strategyFor(fileName);
    ParsedImportFile parsedFile = strategy.parse(content);

    Map<String, String> suggestedMapping = suggestedMapping(parsedFile.columns());
    List<String> duplicateExternalIds = duplicateExternalIds(dataset, parsedFile.rows(), suggestedMapping);
    String storageKey = storageKey(datasetPublicId, fileName);
    objectStorageService.store(
        new StoreObjectCommand(storageKey, fileName, file.getContentType(), content));

    TestCaseImportPreview preview =
        TestCaseImportPreview.builder()
            .dataset(dataset)
            .fileName(fileName)
            .contentType(file.getContentType())
            .storageKey(storageKey)
            .totalRows(parsedFile.rows().size())
            .detectedColumns(parsedFile.columns())
            .suggestedMapping(suggestedMapping)
            .sampleRows(toStoredSampleRows(parsedFile.rows()))
            .duplicateExternalIds(duplicateExternalIds)
            .expiresAt(OffsetDateTime.now().plusMinutes(PREVIEW_EXPIRY_MINUTES))
            .build();

    return toPreviewResponse(previewRepository.save(preview));
  }

  @Override
  @Transactional
  public ImportConfirmResponse confirmImport(
      UUID datasetPublicId, ConfirmTestCaseImportRequest request, String username) {
    Dataset dataset = getActiveDataset(datasetPublicId);
    TestCaseImportPreview preview =
        previewRepository
            .findByPublicId(request.previewId())
            .orElseThrow(() -> new ResourceException("Import preview not found", ErrorCode.RESOURCE_NOT_FOUND.getStatus(), "IMPORT_PREVIEW_NOT_FOUND"));

    if (!preview.getDataset().getPublicId().equals(datasetPublicId)) {
      throw new ResourceException(ErrorCode.DATASET_NOT_FOUND);
    }
    if (preview.isConfirmed()) {
      throw new ResourceException("Import preview has already been confirmed", ErrorCode.VALIDATION_ERROR.getStatus(), "IMPORT_PREVIEW_CONFIRMED");
    }
    if (preview.getExpiresAt().isBefore(OffsetDateTime.now())) {
      throw new ResourceException("Import preview has expired", ErrorCode.VALIDATION_ERROR.getStatus(), "PREVIEW_EXPIRED");
    }

    byte[] content = readStoredFile(preview.getStorageKey());
    ParsedImportFile parsedFile = strategyFor(preview.getFileName()).parse(content);
    Map<String, String> columnMapping =
        request.columnMapping() == null || request.columnMapping().isEmpty()
            ? preview.getSuggestedMapping()
            : request.columnMapping();
    boolean skipDuplicates = Boolean.TRUE.equals(request.skipDuplicates());
    Set<String> existingExternalIds = new HashSet<>(duplicateExternalIds(dataset, parsedFile.rows(), columnMapping));

    int imported = 0;
    int skipped = 0;
    List<ImportRowError> errors = new ArrayList<>();
    List<TestCase> pendingBatch = new ArrayList<>();
    for (ParsedImportRow row : parsedFile.rows()) {
      RowValues values = mappedValues(row, columnMapping);
      if (values.input() == null || values.input().isBlank()) {
        errors.add(new ImportRowError(row.rowNumber(), "Missing required input"));
        continue;
      }
      if (values.externalId() != null && existingExternalIds.contains(values.externalId())) {
        if (skipDuplicates) {
          skipped++;
        } else {
          errors.add(new ImportRowError(row.rowNumber(), "Duplicate external ID: " + values.externalId()));
        }
        continue;
      }

      pendingBatch.add(toImportedTestCase(dataset, values, request.defaultTags()));
      imported++;
      if (pendingBatch.size() >= IMPORT_BATCH_SIZE) {
        testCaseRepository.saveAll(pendingBatch);
        pendingBatch.clear();
      }
    }
    if (!pendingBatch.isEmpty()) {
      testCaseRepository.saveAll(pendingBatch);
    }

    preview.setConfirmed(true);
    return new ImportConfirmResponse(
        preview.getPublicId(),
        dataset.getPublicId(),
        parsedFile.rows().size(),
        imported,
        skipped,
        errors.size(),
        errors,
        OffsetDateTime.now());
  }

  private Dataset getActiveDataset(UUID datasetPublicId) {
    Dataset dataset =
        datasetRepository
            .findByPublicId(datasetPublicId)
            .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
    if (dataset.isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
    return dataset;
  }

  private byte[] readFile(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResourceException(ErrorCode.IMPORT_FILE_EMPTY);
    }
    try {
      return file.getBytes();
    } catch (Exception ex) {
      throw new ResourceException(ErrorCode.IMPORT_FILE_INVALID_FORMAT);
    }
  }

  private byte[] readStoredFile(String storageKey) {
    try {
      return objectStorageService.load(storageKey).resource().getInputStream().readAllBytes();
    } catch (Exception ex) {
      throw new ResourceException(ErrorCode.IMPORT_FILE_INVALID_FORMAT);
    }
  }

  private TestCaseImportStrategy strategyFor(String fileName) {
    return importStrategies.stream()
        .filter(strategy -> strategy.supports(fileName))
        .findFirst()
        .orElseThrow(() -> new ResourceException(ErrorCode.IMPORT_FILE_INVALID_FORMAT));
  }

  private String storageKey(UUID datasetPublicId, String fileName) {
    String safeFileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    return "imports/test-cases/" + datasetPublicId + "/" + UUID.randomUUID() + "-" + safeFileName;
  }

  private Map<String, String> suggestedMapping(List<String> columns) {
    Map<String, String> mapping = new LinkedHashMap<>();
    for (String column : columns) {
      String target = targetFieldFor(column);
      if (target != null) {
        mapping.put(column, target);
      }
    }
    return mapping;
  }

  private String targetFieldFor(String column) {
    return switch (normalize(column)) {
      case "id", "externalid", "external_id" -> "externalId";
      case "sectionname", "section_name" -> "sectionName";
      case "customnlpsample", "custom_nlp_sample", "input" -> "input";
      case "customnlpexpecteddialog", "custom_nlp_expected_dialog", "expectedbehavior", "expected_behavior" -> "expectedBehavior";
      case "name" -> "name";
      case "description" -> "description";
      case "referenceanswer", "reference_answer" -> "referenceAnswer";
      case "preconditions" -> "preconditions";
      default -> null;
    };
  }

  private String normalize(String value) {
    return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_]", "");
  }

  private List<String> duplicateExternalIds(
      Dataset dataset, List<ParsedImportRow> rows, Map<String, String> columnMapping) {
    String externalIdColumn = sourceColumnFor(columnMapping, "externalId");
    if (externalIdColumn == null) {
      return List.of();
    }
    List<String> externalIds =
        rows.stream()
            .map(row -> row.values().get(externalIdColumn))
            .filter(this::hasText)
            .distinct()
            .toList();
    if (externalIds.isEmpty()) {
      return List.of();
    }
    return testCaseRepository.findByDatasetAndExternalIdIn(dataset, externalIds).stream()
        .map(TestCase::getExternalId)
        .toList();
  }

  private String sourceColumnFor(Map<String, String> columnMapping, String targetField) {
    return columnMapping.entrySet().stream()
        .filter(entry -> targetField.equals(entry.getValue()))
        .map(Map.Entry::getKey)
        .findFirst()
        .orElse(null);
  }

  private List<Map<String, Object>> toStoredSampleRows(List<ParsedImportRow> rows) {
    return rows.stream()
        .limit(PREVIEW_SAMPLE_SIZE)
        .map(
            row -> {
              Map<String, Object> stored = new HashMap<>();
              stored.put("row", row.rowNumber());
              stored.put("data", row.values());
              return stored;
            })
        .toList();
  }

  private ImportPreviewResponse toPreviewResponse(TestCaseImportPreview preview) {
    List<ImportSampleRow> sampleRows =
        preview.getSampleRows().stream()
            .map(this::toSampleRow)
            .toList();
    return new ImportPreviewResponse(
        preview.getPublicId(),
        preview.getFileName(),
        preview.getTotalRows(),
        preview.getDetectedColumns(),
        preview.getSuggestedMapping(),
        sampleRows,
        preview.getDuplicateExternalIds().size(),
        preview.getDuplicateExternalIds(),
        preview.getExpiresAt());
  }

  @SuppressWarnings("unchecked")
  private ImportSampleRow toSampleRow(Map<String, Object> stored) {
    int row = ((Number) stored.getOrDefault("row", 0)).intValue();
    return new ImportSampleRow(row, (Map<String, Object>) stored.getOrDefault("data", Map.of()));
  }

  private RowValues mappedValues(ParsedImportRow row, Map<String, String> columnMapping) {
    Map<String, String> values = new HashMap<>();
    columnMapping.forEach((sourceColumn, targetField) -> values.put(targetField, row.values().get(sourceColumn)));
    return new RowValues(
        values.get("externalId"),
        values.get("sectionName"),
        values.get("name"),
        values.get("description"),
        values.get("input"),
        values.get("expectedBehavior"),
        values.get("referenceAnswer"),
        values.get("preconditions"));
  }

  private TestCase toImportedTestCase(Dataset dataset, RowValues values, List<String> defaultTags) {
    return TestCase.builder()
        .dataset(dataset)
        .externalId(blankToNull(values.externalId()))
        .sectionName(blankToNull(values.sectionName()))
        .name(blankToNull(values.name()))
        .description(blankToNull(values.description()))
        .input(values.input().trim())
        .expectedBehavior(blankToNull(values.expectedBehavior()))
        .referenceAnswer(blankToNull(values.referenceAnswer()))
        .preconditions(blankToNull(values.preconditions()))
        .tags(defaultTags == null ? new ArrayList<>() : new ArrayList<>(defaultTags))
        .priority(TestPriority.P2)
        .enabled(true)
        .source(TestCaseSource.IMPORTED)
        .sortOrder(0)
        .build();
  }

  private String blankToNull(String value) {
    return hasText(value) ? value.trim() : null;
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }

  private record RowValues(
      String externalId,
      String sectionName,
      String name,
      String description,
      String input,
      String expectedBehavior,
      String referenceAnswer,
      String preconditions) {}
}

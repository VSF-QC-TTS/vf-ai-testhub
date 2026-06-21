package vn.vinfast.aitesthub.testcase.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.dataset.entity.Dataset;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "test_case_import_previews",
    indexes = {
      @Index(name = "idx_test_case_import_previews_dataset", columnList = "dataset_id"),
      @Index(name = "idx_test_case_import_previews_expires_at", columnList = "expires_at")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseImportPreview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "dataset_id", nullable = false)
  private Dataset dataset;

  @Column(name = "file_name", nullable = false, length = 500)
  private String fileName;

  @Column(name = "content_type", length = 255)
  private String contentType;

  @Column(name = "storage_key", nullable = false, length = 1000)
  private String storageKey;

  @Column(name = "total_rows", nullable = false)
  private int totalRows;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "detected_columns", columnDefinition = "jsonb")
  @Builder.Default
  private List<String> detectedColumns = new ArrayList<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "suggested_mapping", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, String> suggestedMapping = new HashMap<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "sample_rows", columnDefinition = "jsonb")
  @Builder.Default
  private List<Map<String, Object>> sampleRows = new ArrayList<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "duplicate_external_ids", columnDefinition = "jsonb")
  @Builder.Default
  private List<String> duplicateExternalIds = new ArrayList<>();

  @Column(nullable = false)
  @Builder.Default
  private boolean confirmed = false;

  @Column(name = "expires_at", nullable = false)
  private OffsetDateTime expiresAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @PrePersist
  void prePersist() {
    createdAt = OffsetDateTime.now();
    if (publicId == null) {
      publicId = UUID.randomUUID();
    }
    if (detectedColumns == null) {
      detectedColumns = new ArrayList<>();
    }
    if (suggestedMapping == null) {
      suggestedMapping = new HashMap<>();
    }
    if (sampleRows == null) {
      sampleRows = new ArrayList<>();
    }
    if (duplicateExternalIds == null) {
      duplicateExternalIds = new ArrayList<>();
    }
  }
}

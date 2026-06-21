package vn.vinfast.aitesthub.testcase.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "test_cases",
    indexes = {
      @Index(name = "idx_test_cases_dataset_id", columnList = "dataset_id"),
      @Index(name = "idx_test_cases_external_id", columnList = "external_id"),
      @Index(name = "idx_test_cases_section_name", columnList = "dataset_id, section_name"),
      @Index(name = "idx_test_cases_priority", columnList = "priority"),
      @Index(name = "idx_test_cases_enabled", columnList = "dataset_id, enabled"),
      @Index(name = "idx_test_cases_source", columnList = "source"),
      @Index(name = "idx_test_cases_sort", columnList = "dataset_id, sort_order")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @Column(name = "external_id", length = 255)
  private String externalId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "dataset_id", nullable = false)
  private Dataset dataset;

  @Column(name = "section_name", length = 500)
  private String sectionName;

  @Column(length = 500)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String input;

  @Column(name = "expected_behavior", columnDefinition = "TEXT")
  private String expectedBehavior;

  @Column(name = "reference_answer", columnDefinition = "TEXT")
  private String referenceAnswer;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> variables = new HashMap<>();

  @Column(columnDefinition = "TEXT")
  private String preconditions;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "test_priority")
  @Builder.Default
  private TestPriority priority = TestPriority.P2;

  @Column(nullable = false)
  @Builder.Default
  private boolean enabled = true;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "test_case_source")
  @Builder.Default
  private TestCaseSource source = TestCaseSource.MANUAL;

  @Column(name = "generated_by", length = 255)
  private String generatedBy;

  @Column(name = "generation_prompt", columnDefinition = "TEXT")
  private String generationPrompt;

  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private Integer sortOrder = 0;

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @Column(name = "updated_at", nullable = false)
  @Builder.Default
  private OffsetDateTime updatedAt = OffsetDateTime.now();

  @PrePersist
  void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    createdAt = now;
    updatedAt = now;
    if (publicId == null) {
      publicId = UUID.randomUUID();
    }
    if (variables == null) {
      variables = new HashMap<>();
    }
    if (tags == null) {
      tags = new ArrayList<>();
    }
    if (priority == null) {
      priority = TestPriority.P2;
    }
    if (source == null) {
      source = TestCaseSource.MANUAL;
    }
    if (sortOrder == null) {
      sortOrder = 0;
    }
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
  }
}

package vn.vinfast.aitesthub.assertion.entity;

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
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "assertions",
    indexes = {
      @Index(name = "idx_assertions_test_case_id", columnList = "test_case_id"),
      @Index(name = "idx_assertions_rubric_id", columnList = "rubric_id"),
      @Index(name = "idx_assertions_scope_type", columnList = "scope, type"),
      @Index(name = "idx_assertions_severity", columnList = "severity"),
      @Index(name = "idx_assertions_enabled", columnList = "test_case_id, enabled")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assertion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "test_case_id", nullable = false)
  private TestCase testCase;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "assertion_scope")
  private AssertionScope scope;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "assertion_type")
  private AssertionType type;

  @Column(name = "target_component", length = 100)
  private String targetComponent;

  @Column(name = "field_path", length = 500)
  private String fieldPath;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "field_paths", columnDefinition = "jsonb")
  @Builder.Default
  private List<String> fieldPaths = new ArrayList<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "expected_value", columnDefinition = "jsonb")
  private Object expectedValue;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rubric_id")
  private Rubric rubric;

  @Column(name = "rubric_override", columnDefinition = "TEXT")
  private String rubricOverride;

  @Column(precision = 5, scale = 4)
  @Builder.Default
  private BigDecimal threshold = BigDecimal.valueOf(0.8);

  @Column(precision = 5, scale = 4)
  @Builder.Default
  private BigDecimal weight = BigDecimal.ONE;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "severity_level")
  @Builder.Default
  private SeverityLevel severity = SeverityLevel.MAJOR;

  @Column(nullable = false)
  @Builder.Default
  private boolean enabled = true;

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
    if (fieldPaths == null) {
      fieldPaths = new ArrayList<>();
    }
    if (threshold == null) {
      threshold = BigDecimal.valueOf(0.8);
    }
    if (weight == null) {
      weight = BigDecimal.ONE;
    }
    if (severity == null) {
      severity = SeverityLevel.MAJOR;
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

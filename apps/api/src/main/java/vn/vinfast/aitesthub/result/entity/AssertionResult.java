package vn.vinfast.aitesthub.result.entity;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "assertion_results",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uq_assertion_results_result_assertion",
          columnNames = {"test_result_id", "assertion_id"})
    },
    indexes = {
      @Index(name = "idx_assertion_results_test_result", columnList = "test_result_id"),
      @Index(name = "idx_assertion_results_assertion", columnList = "assertion_id"),
      @Index(name = "idx_assertion_results_status", columnList = "status"),
      @Index(name = "idx_assertion_results_severity", columnList = "severity"),
      @Index(name = "idx_assertion_results_result_status", columnList = "test_result_id, status")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssertionResult {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "test_result_id", nullable = false)
  private TestResult testResult;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "assertion_id", nullable = false)
  private Assertion assertion;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "review_status")
  private ReviewStatus status;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "actual_value", columnDefinition = "jsonb")
  private Object actualValue;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "expected_value", columnDefinition = "jsonb")
  private Object expectedValue;

  @Column(columnDefinition = "TEXT")
  private String reason;

  @Column(precision = 5, scale = 4)
  private BigDecimal score;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "severity_level")
  private SeverityLevel severity;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> metadata = new HashMap<>();

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @PrePersist
  void prePersist() {
    if (publicId == null) {
      publicId = UUID.randomUUID();
    }
    if (createdAt == null) {
      createdAt = OffsetDateTime.now();
    }
  }
}

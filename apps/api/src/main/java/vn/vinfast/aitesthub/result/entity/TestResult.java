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
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "test_results",
    uniqueConstraints = {
      @UniqueConstraint(name = "uq_test_results_run_case", columnNames = {"run_id", "test_case_id"})
    },
    indexes = {
      @Index(name = "idx_test_results_run_id", columnList = "run_id"),
      @Index(name = "idx_test_results_test_case_id", columnList = "test_case_id"),
      @Index(name = "idx_test_results_status", columnList = "status"),
      @Index(name = "idx_test_results_run_status", columnList = "run_id, status"),
      @Index(name = "idx_test_results_created_at", columnList = "created_at")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "run_id", nullable = false)
  private Run run;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "test_case_id", nullable = false)
  private TestCase testCase;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "review_status")
  @Builder.Default
  private ReviewStatus status = ReviewStatus.SKIPPED;

  @Column(precision = 5, scale = 4)
  private BigDecimal score;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "request_snapshot", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> requestSnapshot = new HashMap<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "raw_response", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> rawResponse = new HashMap<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "response_snapshot", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> responseSnapshot = new HashMap<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "extracted_components", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> extractedComponents = new HashMap<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "extracted_tool_calls", columnDefinition = "jsonb")
  @Builder.Default
  private Object extractedToolCalls = new java.util.ArrayList<>();

  @Column(name = "latency_ms")
  private Integer latencyMs;

  @Column(name = "error_message", columnDefinition = "TEXT")
  private String errorMessage;

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
    if (status == null) {
      status = ReviewStatus.SKIPPED;
    }
  }
}

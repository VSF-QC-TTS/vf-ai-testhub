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
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "tool_expectation_results",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uq_tool_exp_results_result_exp",
          columnNames = {"test_result_id", "tool_expectation_id"})
    },
    indexes = {
      @Index(name = "idx_tool_exp_results_test_result", columnList = "test_result_id"),
      @Index(name = "idx_tool_exp_results_tool_exp", columnList = "tool_expectation_id"),
      @Index(name = "idx_tool_exp_results_status", columnList = "status"),
      @Index(name = "idx_tool_exp_results_result_status", columnList = "test_result_id, status")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolExpectationResult {

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
  @JoinColumn(name = "tool_expectation_id", nullable = false)
  private ToolExpectation toolExpectation;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "review_status")
  private ReviewStatus status;

  @Column(name = "expected_tool_name", length = 255)
  private String expectedToolName;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "actual_tool_calls", columnDefinition = "jsonb")
  private Object actualToolCalls;

  @Column(name = "actual_agent", length = 255)
  private String actualAgent;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "actual_steps", columnDefinition = "jsonb")
  private Object actualSteps;

  @Column(columnDefinition = "TEXT")
  private String reason;

  @Column(precision = 5, scale = 4)
  private BigDecimal score;

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
